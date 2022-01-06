/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DebugProtocol } from '@vscode/debugprotocol';


export class Message implements DebugProtocol.ProtocolMessage {
	seq: number;
	type: string;

	public constructor(type: string) {
		this.seq = 0;
		this.type = type;
	}
}

export class Response extends Message implements DebugProtocol.Response {
	request_seq: number;
	success: boolean;
	command: string;

	public constructor(request: DebugProtocol.Request, message?: string) {
		super('response');
		this.request_seq = request.seq;
		this.command = request.command;
		if (message) {
			this.success = false;
			(<any>this).message = message;
		} else {
			this.success = true;
		}
	}
}

export class Event extends Message implements DebugProtocol.Event {
	event: string;

	public constructor(event: string, body?: any) {
		super('event');
		this.event = event;
		if (body) {
			(<any>this).body = body;
		}
	}
}
