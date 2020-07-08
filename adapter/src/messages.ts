/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DebugProtocol } from 'vscode-debugprotocol';


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

export class SetBreakpointsResponse extends Response implements DebugProtocol.SetBreakpointsResponse {
	body = {
		breakpoints: []
	};
}

export class SetFunctionBreakpointsResponse extends Response implements DebugProtocol.SetFunctionBreakpointsResponse {
	body = {
		breakpoints: []
	};
}

export class ContinueResponse extends Response implements DebugProtocol.ContinueResponse {
	body = {
		allThreadsContinued: undefined
	};
}

export class ScopesResponse extends Response implements DebugProtocol.ScopesResponse {
	body = {
		scopes: []
	};
}

export class StackTraceResponse extends Response implements DebugProtocol.StackTraceResponse {
	body = {
		stackFrames: [],
		totalFrames: undefined
	};
}

export class VariablesResponse extends Response implements DebugProtocol.VariablesResponse {
	body = {
		variables: []
	};
}

export class SetVariableResponse extends Response implements DebugProtocol.SetVariableResponse {
	body: {
		value: "";
		type: undefined,
		variablesReference: undefined,
		namedVariables: undefined,
		indexedVariables: undefined
	};
}

export class SetExpressionResponse extends Response implements DebugProtocol.SetExpressionResponse {
	body: {
		value: "";
		type: undefined,
		presentationHint: undefined,
		variablesReference: undefined,
		namedVariables: undefined,
		indexedVariables: undefined
	};
}

export class SourceResponse extends Response implements DebugProtocol.SourceResponse {
	body: {
		content: "";
		mimeType: undefined;
	};
}

export class ThreadsResponse extends Response implements DebugProtocol.ThreadsResponse {
	body: {
		threads: []
	};
}

export class EvaluateResponse extends Response implements DebugProtocol.EvaluateResponse {
	body: {
		result: "",
		type: undefined,
		presentationHint: undefined,
		variablesReference: 0,
		namedVariables: undefined,
		indexedVariables: undefined,
		memoryReference: undefined
	};
}

export class StepInTargetsResponse extends Response implements DebugProtocol.StepInTargetsResponse {
	body: {
		targets: []
	};
}

export class GotoTargetsResponse extends Response implements DebugProtocol.GotoTargetsResponse {
	body: {
		targets: []
	};
}

export class CompletionsResponse extends Response implements DebugProtocol.CompletionsResponse {
	body: {
		targets: []
	};
}

export class ExceptionInfoResponse extends Response implements DebugProtocol.ExceptionInfoResponse {
	body: {
		exceptionId: "",
		description: undefined,
		breakMode: 'never',
		details: undefined
	};
}

export class LoadedSourcesResponse extends Response implements DebugProtocol.LoadedSourcesResponse {
	body: {
		sources: []
	};
}

export class DataBreakpointInfoResponse extends Response implements DebugProtocol.DataBreakpointInfoResponse {
	body: {
		dataId: null,
		description: "",
		accessTypes: undefined,
		canPersist: undefined
	};
}

export class BreakpointLocationsResponse extends Response implements DebugProtocol.BreakpointLocationsResponse {
	body: {
		breakpoints: []
	};
}

export class SetDataBreakpointsResponse extends Response implements DebugProtocol.SetDataBreakpointsResponse {
	body: {
		breakpoints: []
	};
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
