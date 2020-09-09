/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IInternalLogger, IInternalLoggerOptions, LogLevel } from "../logger";

/**
 * In a browser/web worker we use a NOP-logger for now.
 */
export class InternalLogger implements IInternalLogger {
	dispose(): Promise<void> {
		return undefined;
	}
	log(msg: string, level: LogLevel, prependTimestamp?: boolean): void {
	}
	setup(options: IInternalLoggerOptions): Promise<void> {
		return undefined;
	}
}