/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';

import { LogLevel, ILogCallback, trimLastNewline, LogOutputEvent, IInternalLoggerOptions, IInternalLogger } from './logger';

/**
 * Manages logging, whether to console.log, file, or VS Code console.
 * Encapsulates the state specific to each logging session
 */
export class InternalLogger implements IInternalLogger {
	private _minLogLevel: LogLevel;
	private _logToConsole: boolean;

	/** Log info that meets minLogLevel is sent to this callback. */
	private _logCallback: ILogCallback;

	/** Write steam for log file */
	private _logFileStream: fs.WriteStream;

	/** Dispose and allow exit to continue normally */
	private beforeExitCallback = () => this.dispose();

	/** Dispose and exit */
	private disposeCallback;

	/** Whether to add a timestamp to messages in the logfile */
	private _prependTimestamp: boolean;

	constructor(logCallback: ILogCallback, isServer?: boolean) {
		this._logCallback = logCallback;
		this._logToConsole = isServer;

		this._minLogLevel = LogLevel.Warn;

		this.disposeCallback = (signal: string, code: number) => {
			this.dispose();

			// Exit with 128 + value of the signal code.
			// https://nodejs.org/api/process.html#process_exit_codes
			code = code || 2; // SIGINT
			code += 128;

			process.exit(code);
		};
	}

	public async setup(options: IInternalLoggerOptions): Promise<void> {
		this._minLogLevel = options.consoleMinLogLevel;
		this._prependTimestamp = options.prependTimestamp;

		// Open a log file in the specified location. Overwritten on each run.
		if (options.logFilePath) {
			if (!path.isAbsolute(options.logFilePath)) {
				this.log(`logFilePath must be an absolute path: ${options.logFilePath}`, LogLevel.Error);
			} else {
				const handleError = (err: Error) => this.sendLog(`Error creating log file at path: ${options.logFilePath}. Error: ${err.toString()}\n`, LogLevel.Error);

				try {
					await fs.promises.mkdir(path.dirname(options.logFilePath), { recursive: true });
					this.log(`Verbose logs are written to:\n`, LogLevel.Warn);
					this.log(options.logFilePath + '\n', LogLevel.Warn);

					this._logFileStream = fs.createWriteStream(options.logFilePath);
					this.logDateTime();
					this.setupShutdownListeners();
					this._logFileStream.on('error', err => {
						handleError(err);
					});
				} catch (err) {
					handleError(err);
				}
			}
		}
	}

	private logDateTime(): void {
		let d = new Date();
		let dateString = d.getUTCFullYear() + '-' + `${d.getUTCMonth() + 1}` + '-' + d.getUTCDate();
		const timeAndDateStamp = dateString + ', ' + getFormattedTimeString();
		this.log(timeAndDateStamp + '\n', LogLevel.Verbose, false);
	}

	private setupShutdownListeners(): void {
		process.on('beforeExit', this.beforeExitCallback);
		process.on('SIGTERM', this.disposeCallback);
		process.on('SIGINT', this.disposeCallback);
	}

	private removeShutdownListeners(): void {
		process.removeListener('beforeExit', this.beforeExitCallback);
		process.removeListener('SIGTERM', this.disposeCallback);
		process.removeListener('SIGINT', this.disposeCallback);
	}

	public dispose(): Promise<void> {
		return new Promise(resolve => {
			this.removeShutdownListeners();
			if (this._logFileStream) {
				this._logFileStream.end(resolve);
				this._logFileStream = null;
			} else {
				resolve();
			}
		});
	}

	public log(msg: string, level: LogLevel, prependTimestamp = true): void {
		if (this._minLogLevel === LogLevel.Stop) {
			return;
		}

		if (level >= this._minLogLevel) {
			this.sendLog(msg, level);
		}

		if (this._logToConsole) {
			const logFn =
				level === LogLevel.Error ? console.error :
				level === LogLevel.Warn ? console.warn :
				null;

			if (logFn) {
				logFn(trimLastNewline(msg));
			}
		}

		// If an error, prepend with '[Error]'
		if (level === LogLevel.Error) {
			msg = `[${LogLevel[level]}] ${msg}`;
		}

		if (this._prependTimestamp && prependTimestamp) {
			msg = '[' + getFormattedTimeString() + '] ' + msg;
		}

		if (this._logFileStream) {
			this._logFileStream.write(msg);
		}
	}

	private sendLog(msg: string, level: LogLevel): void {
		// Truncate long messages, they can hang VS Code
		if (msg.length > 1500) {
			const endsInNewline = !!msg.match(/(\n|\r\n)$/);
			msg = msg.substr(0, 1500) + '[...]';
			if (endsInNewline) {
				msg = msg + '\n';
			}
		}

		if (this._logCallback) {
			const event = new LogOutputEvent(msg, level);
			this._logCallback(event);
		}
	}
}

function getFormattedTimeString(): string {
	let d = new Date();
	let hourString = _padZeroes(2, String(d.getUTCHours()));
	let minuteString = _padZeroes(2, String(d.getUTCMinutes()));
	let secondString = _padZeroes(2, String(d.getUTCSeconds()));
	let millisecondString = _padZeroes(3, String(d.getUTCMilliseconds()));
	return hourString + ':' + minuteString + ':' + secondString + '.' + millisecondString + ' UTC';
}

function _padZeroes(minDesiredLength: number, numberToPad: string): string {
	if (numberToPad.length >= minDesiredLength) {
		return numberToPad;
	} else {
		return String('0'.repeat(minDesiredLength) + numberToPad).slice(-minDesiredLength);
	}
}
