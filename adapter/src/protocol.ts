/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as ee from 'events';
import { DebugProtocol } from 'vscode-debugprotocol';
import { Response, Event } from './messages';


export class ProtocolServer extends ee.EventEmitter {

	private static TIMEOUT = 3000;
	private static TWO_CRLF = '\r\n\r\n';

	private _rawData: Buffer;
	private _contentLength: number;
	private _sequence: number;
	private _writableStream: NodeJS.WritableStream;
	private _pendingRequests = new Map<number, DebugProtocol.Response>();

	constructor() {
		super();
	}

	public start(inStream: NodeJS.ReadableStream, outStream: NodeJS.WritableStream): void {
		this._sequence = 1;
		this._writableStream = outStream;
		this._rawData = new Buffer(0);

		inStream.on('data', (data: Buffer) => this._handleData(data));

		inStream.on('close', () => {
			this._emitEvent(new Event('close'));
		});
		inStream.on('error', (error) => {
			this._emitEvent(new Event('error'));
		});

		outStream.on('error', (error) => {
			this._emitEvent(new Event('error'));
		});

		inStream.resume();
	}

	public stop(): void {
		if (this._writableStream) {
			this._writableStream.end();
		}
	}

	public send(command: string, args: any, timeout: number = ProtocolServer.TIMEOUT): Promise<DebugProtocol.Response> {
		return new Promise((completeDispatch, errorDispatch) => {
			this._sendRequest(command, args, timeout, (result: DebugProtocol.Response) => {
				if (result.success) {
					completeDispatch(result);
				} else {
					errorDispatch(result);
				}
			});
		});
	}

	public sendEvent(event: DebugProtocol.Event): void {
		this._send('event', event);
	}

	public sendResponse(response: DebugProtocol.Response): void {
		if (response.seq > 0) {
			console.error('attempt to send more than one response for command {0}', response.command);
		} else {
			this._send('response', response);
		}
	}

	// ---- protected ----------------------------------------------------------

	protected dispatchRequest(request: DebugProtocol.Request): void {
	}

	// ---- private ------------------------------------------------------------

	private _sendRequest(command: string, args: any, timeout: number, cb: (response: DebugProtocol.Response) => void): void {

		const request: any = {
			command: command
		};
		if (args && Object.keys(args).length > 0) {
			request.arguments = args;
		}

		this._send('request', request);

		if (cb) {
			this._pendingRequests[request.seq] = cb;

			const timer = setTimeout(() => {
				clearTimeout(timer);
				const clb = this._pendingRequests[request.seq];
				if (clb) {
					delete this._pendingRequests[request.seq];
					clb(new Response(request, 'timeout after ' + timeout + 'ms'));

					this._emitEvent(new Event('diagnostic', { reason: 'unresponsive ' + command }));
				}
			}, timeout);
		}
	}

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
							this._dispatch(JSON.parse(message));
						}
						catch (e) {
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

	private _dispatch(message: DebugProtocol.ProtocolMessage): void {
		switch (message.type) {
		case 'event':
			this._emitEvent(<DebugProtocol.Event> message);
			break;
		case 'response':
			const response = <DebugProtocol.Response> message;
			const clb = this._pendingRequests[response.request_seq];
			if (clb) {
				delete this._pendingRequests[response.request_seq];
				clb(response);
			}
			break;
		case 'request':
			this.dispatchRequest(<DebugProtocol.Request> message);
			break;
		default:
			break;
		}
	}
}
