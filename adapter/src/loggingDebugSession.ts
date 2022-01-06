/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {DebugProtocol} from '@vscode/debugprotocol';

import * as Logger from './logger';
const logger = Logger.logger;
import {DebugSession, OutputEvent} from './debugSession';

export class LoggingDebugSession extends DebugSession {
	public constructor(private obsolete_logFilePath?: string, obsolete_debuggerLinesAndColumnsStartAt1?: boolean, obsolete_isServer?: boolean) {
		super(obsolete_debuggerLinesAndColumnsStartAt1, obsolete_isServer);

		this.on('error', (event: DebugProtocol.Event) => {
			logger.error(event.body);
		});
	}

	public start(inStream: NodeJS.ReadableStream, outStream: NodeJS.WritableStream): void {
		super.start(inStream, outStream);
		logger.init(e => this.sendEvent(e), this.obsolete_logFilePath, this._isServer);
	}

	/**
	 * Overload sendEvent to log
	 */
	public sendEvent(event: DebugProtocol.Event): void {
		if (!(event instanceof Logger.LogOutputEvent)) {
			// Don't create an infinite loop...

			let objectToLog = event;
			if (event instanceof OutputEvent && event.body && event.body.data && event.body.data.doNotLogOutput) {
				delete event.body.data.doNotLogOutput;
				objectToLog = { ...event };
				objectToLog.body = { ...event.body, output: '<output not logged>' }
			}

			logger.verbose(`To client: ${JSON.stringify(objectToLog)}`);
		}

		super.sendEvent(event);
	}

	/**
	 * Overload sendRequest to log
	 */
	public sendRequest(command: string, args: any, timeout: number, cb: (response: DebugProtocol.Response) => void): void {
		logger.verbose(`To client: ${JSON.stringify(command)}(${JSON.stringify(args)}), timeout: ${timeout}`);
		super.sendRequest(command, args, timeout, cb);
	}

	/**
	 * Overload sendResponse to log
	 */
	public sendResponse(response: DebugProtocol.Response): void {
		logger.verbose(`To client: ${JSON.stringify(response)}`);
		super.sendResponse(response);
	}

	protected dispatchRequest(request: DebugProtocol.Request): void {
		logger.verbose(`From client: ${request.command}(${JSON.stringify(request.arguments) })`);
		super.dispatchRequest(request);
	}
}
