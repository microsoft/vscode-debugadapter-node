/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as ee from 'events';
import { DebugProtocol } from '@vscode/debugprotocol';
import { Response, Event } from './messages';

interface DebugProtocolMessage {
}

interface IDisposable {
	dispose(): void;
}

class Disposable0 implements IDisposable {
	dispose(): any {
	}
}

interface Event0<T> {
	(listener: (e: T) => any, thisArg?: any): Disposable0;
}

class Emitter<T> {

	private _event?: Event0<T>;
	private _listener?: (e: T) => void;
	private _this?: any;

	get event(): Event0<T> {
		if (!this._event) {
			this._event = (listener: (e: T) => any, thisArg?: any) => {

				this._listener = listener;
				this._this = thisArg;

				let result: IDisposable;
				result = {
					dispose: () => {
						this._listener = undefined;
						this._this = undefined;
					}
				};
				return result;
			};
		}
		return this._event;
	}

	fire(event: T): void {
		if (this._listener) {
			try {
				this._listener.call(this._this, event);
			} catch (e) {
			}
		}
	}

	hasListener() : boolean {
		return !!this._listener;
	}

	dispose() {
		this._listener = undefined;
		this._this = undefined;
	}
}

/**
 * A structurally equivalent copy of vscode.DebugAdapter
 */
interface VSCodeDebugAdapter extends Disposable0 {

	readonly onDidSendMessage: Event0<DebugProtocolMessage>;

	handleMessage(message: DebugProtocol.ProtocolMessage): void;
}

export class ProtocolServer extends ee.EventEmitter implements VSCodeDebugAdapter {

	private static TWO_CRLF = '\r\n\r\n';

	private _sendMessage = new Emitter<DebugProtocolMessage>();

	private _rawData: Buffer;
	private _contentLength: number;
	private _sequence: number = 1;
	private _writableStream: NodeJS.WritableStream;
	private _pendingRequests = new Map<number, (response: DebugProtocol.Response) => void>();

	constructor() {
		super();
	}

	// ---- implements vscode.Debugadapter interface ---------------------------

	public dispose(): any {
	}

	public onDidSendMessage: Event0<DebugProtocolMessage> = this._sendMessage.event;

	public handleMessage(msg: DebugProtocol.ProtocolMessage): void {
		if (msg.type === 'request') {
			this.dispatchRequest(<DebugProtocol.Request>msg);
		} else if (msg.type === 'response') {
			const response = <DebugProtocol.Response>msg;
			const clb = this._pendingRequests.get(response.request_seq);
			if (clb) {
				this._pendingRequests.delete(response.request_seq);
				clb(response);
			}
		}
	}

	protected _isRunningInline() {
		return this._sendMessage && this._sendMessage.hasListener();
	}

	//--------------------------------------------------------------------------

	public start(inStream: NodeJS.ReadableStream, outStream: NodeJS.WritableStream): void {
		this._writableStream = outStream;
		this._rawData = Buffer.alloc(0);

		inStream.on('data', (data: Buffer) => this._handleData(data));

		inStream.on('close', () => {
			this._emitEvent(new Event('close'));
		});
		inStream.on('error', (error) => {
			this._emitEvent(new Event('error', 'inStream error: ' + (error && error.message)));
		});

		outStream.on('error', (error) => {
			this._emitEvent(new Event('error', 'outStream error: ' + (error && error.message)));
		});

		inStream.resume();
	}

	public stop(): void {
		if (this._writableStream) {
			this._writableStream.end();
		}
	}

	public sendEvent(event: DebugProtocol.Event): void {
		this._send('event', event);
	}

	public sendResponse(response: DebugProtocol.Response): void {
		if (response.seq > 0) {
			console.error(`attempt to send more than one response for command ${response.command}`);
		} else {
			this._send('response', response);
		}
	}

	public sendRequest(command: string, args: any, timeout: number, cb: (response: DebugProtocol.Response) => void) : void {

		const request: any = {
			command: command
		};
		if (args && Object.keys(args).length > 0) {
			request.arguments = args;
		}

		this._send('request', request);

		if (cb) {
			this._pendingRequests.set(request.seq, cb);

			const timer = setTimeout(() => {
				clearTimeout(timer);
				const clb = this._pendingRequests.get(request.seq);
				if (clb) {
					this._pendingRequests.delete(request.seq);
					clb(new Response(request, 'timeout'));
				}
			}, timeout);
		}
	}

	// ---- protected ----------------------------------------------------------

	protected dispatchRequest(request: DebugProtocol.Request): void {
	}

	// ---- private ------------------------------------------------------------

	private _emitEvent(event: DebugProtocol.Event) {
		this.emit(event.event, event);
	}

	private _send(typ: 'request' | 'response' | 'event', message: DebugProtocol.ProtocolMessage): void {

		message.type = typ;
		message.seq = this._sequence++;

		if (this._writableStream) {
			const json = JSON.stringify(message);
			this._writableStream.write(`Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`, 'utf8');
		}
		this._sendMessage.fire(message);
	}

	private _handleData(data: Buffer): void {

		this._rawData = Buffer.concat([this._rawData, data]);

		while (true) {
			if (this._contentLength >= 0) {
				if (this._rawData.length >= this._contentLength) {
					const message = this._rawData.toString('utf8', 0, this._contentLength);
					this._rawData = this._rawData.slice(this._contentLength);
					this._contentLength = -1;
					if (message.length > 0) {
						try {
							let msg: DebugProtocol.ProtocolMessage = JSON.parse(message);
							this.handleMessage(msg);
						}
						catch (e) {
							this._emitEvent(new Event('error', 'Error handling data: ' + (e && e.message)));
						}
					}
					continue;	// there may be more complete messages to process
				}
			} else {
				const idx = this._rawData.indexOf(ProtocolServer.TWO_CRLF);
				if (idx !== -1) {
					const header = this._rawData.toString('utf8', 0, idx);
					const lines = header.split('\r\n');
					for (let i = 0; i < lines.length; i++) {
						const pair = lines[i].split(/: +/);
						if (pair[0] == 'Content-Length') {
							this._contentLength = +pair[1];
						}
					}
					this._rawData = this._rawData.slice(idx + ProtocolServer.TWO_CRLF.length);
					continue;
				}
			}
			break;
		}
	}
}
