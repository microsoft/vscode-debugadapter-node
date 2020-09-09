/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { InternalLogger } from './internalLogger';
import { OutputEvent } from './debugSession';

export enum LogLevel {
	Verbose = 0,
	Log = 1,
	Warn = 2,
	Error = 3,
	Stop = 4
}

export type ILogCallback = (outputEvent: OutputEvent) => void;

interface ILogItem {
	msg: string;
	level: LogLevel;
}

export interface ILogger {
	log(msg: string, level?: LogLevel): void;
	verbose(msg: string): void;
	warn(msg: string): void;
	error(msg: string): void;
}

export interface IInternalLogger {
	dispose(): Promise<void>;
	log(msg: string, level: LogLevel, prependTimestamp?: boolean) : void;
	setup(options: IInternalLoggerOptions): Promise<void>;
}

export interface IInternalLoggerOptions {
	consoleMinLogLevel: LogLevel;
	logFilePath?: string;
	prependTimestamp?: boolean;
}

export class Logger {
	private _logFilePathFromInit: string;

	private _currentLogger: IInternalLogger;
	private _pendingLogQ: ILogItem[] = [];

	log(msg: string, level = LogLevel.Log): void {
		msg = msg + '\n';
		this._write(msg, level);
	}

	verbose(msg: string): void {
		this.log(msg, LogLevel.Verbose);
	}

	warn(msg: string): void {
		this.log(msg, LogLevel.Warn);
	}

	error(msg: string): void {
		this.log(msg, LogLevel.Error);
	}

	dispose(): Promise<void> {
		if (this._currentLogger) {
			const disposeP = this._currentLogger.dispose();
			this._currentLogger = null;
			return disposeP;
		} else {
			return Promise.resolve();
		}
	}

	/**
	 * `log` adds a newline, `write` doesn't
	 */
	private _write(msg: string, level = LogLevel.Log): void {
		// [null, undefined] => string
		msg = msg + '';
		if (this._pendingLogQ) {
			this._pendingLogQ.push({ msg, level });
		} else if (this._currentLogger) {
			this._currentLogger.log(msg, level);
		}
	}

	/**
	 * Set the logger's minimum level to log in the console, and whether to log to the file. Log messages are queued before this is
	 * called the first time, because minLogLevel defaults to Warn.
	 */
	setup(consoleMinLogLevel: LogLevel, _logFilePath?: string|boolean, prependTimestamp: boolean = true): void {
		const logFilePath = typeof _logFilePath === 'string' ?
			_logFilePath :
			(_logFilePath && this._logFilePathFromInit);

		if (this._currentLogger) {
			const options = {
				consoleMinLogLevel,
				logFilePath,
				prependTimestamp
			};
			this._currentLogger.setup(options).then(() => {
				// Now that we have a minimum logLevel, we can clear out the queue of pending messages
				if (this._pendingLogQ) {
					const logQ = this._pendingLogQ;
					this._pendingLogQ = null;
					logQ.forEach(item => this._write(item.msg, item.level));
				}
			});

		}
	}

	init(logCallback: ILogCallback, logFilePath?: string, logToConsole?: boolean): void {
		// Re-init, create new global Logger
		this._pendingLogQ = this._pendingLogQ || [];
		this._currentLogger = new InternalLogger(logCallback, logToConsole);
		this._logFilePathFromInit = logFilePath;
	}
}

export const logger = new Logger();

export class LogOutputEvent extends OutputEvent {
	constructor(msg: string, level: LogLevel) {
		const category =
			level === LogLevel.Error ? 'stderr' :
			level === LogLevel.Warn ? 'console' :
			'stdout';
		super(msg, category);
	}
}

export function trimLastNewline(str: string): string {
	return str.replace(/(\n|\r\n)$/, '');
}


