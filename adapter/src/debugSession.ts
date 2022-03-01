/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DebugProtocol } from '@vscode/debugprotocol';
import { ProtocolServer } from './protocol';
import { Response, Event } from './messages';
import { runDebugAdapter } from './runDebugAdapter';
import { URL } from 'url';


export class Source implements DebugProtocol.Source {
	name: string;
	path: string;
	sourceReference: number;

	public constructor(name: string, path?: string, id: number = 0, origin?: string, data?: any) {
		this.name = name;
		this.path = path;
		this.sourceReference = id;
		if (origin) {
			(<any>this).origin = origin;
		}
		if (data) {
			(<any>this).adapterData = data;
		}
	}
}

export class Scope implements DebugProtocol.Scope {
	name: string;
	variablesReference: number;
	expensive: boolean;

	public constructor(name: string, reference: number, expensive: boolean = false) {
		this.name = name;
		this.variablesReference = reference;
		this.expensive = expensive;
	}
}

export class StackFrame implements DebugProtocol.StackFrame {
	id: number;
	name: string;
	source?: DebugProtocol.Source;
	line: number;
	column: number;
	endLine?: number;
	endColumn?: number;
	canRestart?: boolean;
	instructionPointerReference?: string;
	moduleId?: number | string;
	presentationHint?: 'normal' | 'label' | 'subtle';

	public constructor(i: number, nm: string, src?: Source, ln: number = 0, col: number = 0) {
		this.id = i;
		this.source = src;
		this.line = ln;
		this.column = col;
		this.name = nm;
	}
}

export class Thread implements DebugProtocol.Thread {
	id: number;
	name: string;

	public constructor(id: number, name: string) {
		this.id = id;
		if (name) {
			this.name = name;
		} else {
			this.name = 'Thread #' + id;
		}
	}
}

export class Variable implements DebugProtocol.Variable {
	name: string;
	value: string;
	variablesReference: number;

	public constructor(name: string, value: string, ref: number = 0, indexedVariables?: number, namedVariables?: number) {
		this.name = name;
		this.value = value;
		this.variablesReference = ref;
		if (typeof namedVariables === 'number') {
			(<DebugProtocol.Variable>this).namedVariables = namedVariables;
		}
		if (typeof indexedVariables === 'number') {
			(<DebugProtocol.Variable>this).indexedVariables = indexedVariables;
		}
	}
}

export class Breakpoint implements DebugProtocol.Breakpoint {
	verified: boolean;

	public constructor(verified: boolean, line?: number, column?: number, source?: Source) {
		this.verified = verified;
		const e: DebugProtocol.Breakpoint = this;
		if (typeof line === 'number') {
			e.line = line;
		}
		if (typeof column === 'number') {
			e.column = column;
		}
		if (source) {
			e.source = source;
		}
	}

	public setId(id: number) {
		(this as DebugProtocol.Breakpoint).id = id;
 	}
}

export class Module implements DebugProtocol.Module {
	id: number | string;
	name: string;

	public constructor(id: number | string, name: string) {
		this.id = id;
		this.name = name;
	}
}

export class CompletionItem implements DebugProtocol.CompletionItem {
	label: string;
	start: number;
	length: number;

	public constructor(label: string, start: number, length: number = 0) {
		this.label = label;
		this.start = start;
		this.length = length;
	}
}

export class StoppedEvent extends Event implements DebugProtocol.StoppedEvent {
	body: {
		reason: string;
	};

	public constructor(reason: string, threadId?: number, exceptionText?: string) {
		super('stopped');
		this.body = {
			reason: reason
		};
		if (typeof threadId === 'number') {
			(this as DebugProtocol.StoppedEvent).body.threadId = threadId;
		}
		if (typeof exceptionText === 'string') {
			(this as DebugProtocol.StoppedEvent).body.text = exceptionText;
		}
	}
}

export class ContinuedEvent extends Event implements DebugProtocol.ContinuedEvent {
	body: {
		threadId: number;
	};

	public constructor(threadId: number, allThreadsContinued?: boolean) {
		super('continued');
		this.body = {
			threadId: threadId
		};

		if (typeof allThreadsContinued === 'boolean') {
			(<DebugProtocol.ContinuedEvent>this).body.allThreadsContinued = allThreadsContinued;
		}
	}
}

export class InitializedEvent extends Event implements DebugProtocol.InitializedEvent {
	public constructor() {
		super('initialized');
	}
}

export class TerminatedEvent extends Event implements DebugProtocol.TerminatedEvent {
	public constructor(restart?: any) {
		super('terminated');
		if (typeof restart === 'boolean' || restart) {
			const e: DebugProtocol.TerminatedEvent = this;
			e.body = {
				restart: restart
			};
		}
	}
}

export class ExitedEvent extends Event implements DebugProtocol.ExitedEvent {
	body: {
		exitCode: number
	};

	public constructor(exitCode: number) {
		super('exited');
		this.body = {
			exitCode: exitCode
		};
	}
}

export class OutputEvent extends Event implements DebugProtocol.OutputEvent {
	body: {
		category: string,
		output: string,
		data?: any
	};

	public constructor(output: string, category: string = 'console', data?: any) {
		super('output');
		this.body = {
			category: category,
			output: output
		};
		if (data !== undefined) {
			this.body.data = data;
		}
	}
}

export class ThreadEvent extends Event implements DebugProtocol.ThreadEvent {
	body: {
		reason: string,
		threadId: number
	};

	public constructor(reason: string, threadId: number) {
		super('thread');
		this.body = {
			reason: reason,
			threadId: threadId
		};
	}
}

export class BreakpointEvent extends Event implements DebugProtocol.BreakpointEvent {
	body: {
		reason: string,
		breakpoint: DebugProtocol.Breakpoint
	};

	public constructor(reason: string, breakpoint: DebugProtocol.Breakpoint) {
		super('breakpoint');
		this.body = {
			reason: reason,
			breakpoint: breakpoint
		};
	}
}

export class ModuleEvent extends Event implements DebugProtocol.ModuleEvent {
	body: {
		reason: 'new' | 'changed' | 'removed',
		module: DebugProtocol.Module
	};

	public constructor(reason: 'new' | 'changed' | 'removed', module: DebugProtocol.Module) {
		super('module');
		this.body = {
			reason: reason,
			module: module
		};
	}
}

export class LoadedSourceEvent extends Event implements DebugProtocol.LoadedSourceEvent {
	body: {
		reason: 'new' | 'changed' | 'removed',
		source: DebugProtocol.Source
	};

	public constructor(reason: 'new' | 'changed' | 'removed', source: DebugProtocol.Source) {
		super('loadedSource');
		this.body = {
			reason: reason,
			source: source
		};
	}
}

export class CapabilitiesEvent extends Event implements DebugProtocol.CapabilitiesEvent {
	body: {
		capabilities: DebugProtocol.Capabilities
	};

	public constructor(capabilities: DebugProtocol.Capabilities) {
		super('capabilities');
		this.body = {
			capabilities: capabilities
		};
	}
}

export class ProgressStartEvent extends Event implements DebugProtocol.ProgressStartEvent {
	body: {
		progressId: string,
		title: string
	};

	public constructor(progressId: string, title: string, message?: string) {
		super('progressStart');
		this.body = {
			progressId: progressId,
			title: title
		};
		if (typeof message === 'string') {
			(this as DebugProtocol.ProgressStartEvent).body.message = message;
		}
	}
}

export class ProgressUpdateEvent extends Event implements DebugProtocol.ProgressUpdateEvent {
	body: {
		progressId: string
	};

	public constructor(progressId: string, message?: string) {
		super('progressUpdate');
		this.body = {
			progressId: progressId
		};
		if (typeof message === 'string') {
			(this as DebugProtocol.ProgressUpdateEvent).body.message = message;
		}
	}
}

export class ProgressEndEvent extends Event implements DebugProtocol.ProgressEndEvent {
	body: {
		progressId: string
	};

	public constructor(progressId: string, message?: string) {
		super('progressEnd');
		this.body = {
			progressId: progressId
		};
		if (typeof message === 'string') {
			(this as DebugProtocol.ProgressEndEvent).body.message = message;
		}
	}
}

export class InvalidatedEvent extends Event implements DebugProtocol.InvalidatedEvent {
	body: {
		areas?: DebugProtocol.InvalidatedAreas[];
		threadId?: number;
		stackFrameId?: number;
	};

	public constructor(areas?: DebugProtocol.InvalidatedAreas[], threadId?: number, stackFrameId?: number) {
		super('invalidated');
		this.body = {
		};
		if (areas) {
			this.body.areas = areas;
		}
		if (threadId) {
			this.body.threadId = threadId;
		}
		if (stackFrameId) {
			this.body.stackFrameId = stackFrameId;
		}
	}
}

export class MemoryEvent extends Event implements DebugProtocol.MemoryEvent {
	body: {
		memoryReference: string;
		offset: number;
		count: number;
	};

	public constructor(memoryReference: string, offset: number, count: number) {
		super('memory');
		this.body = { memoryReference, offset, count };
	}
}

export enum ErrorDestination {
	User = 1,
	Telemetry = 2
};

export class DebugSession extends ProtocolServer {

	private _debuggerLinesStartAt1: boolean;
	private _debuggerColumnsStartAt1: boolean;
	private _debuggerPathsAreURIs: boolean;

	private _clientLinesStartAt1: boolean;
	private _clientColumnsStartAt1: boolean;
	private _clientPathsAreURIs: boolean;

	protected _isServer: boolean;

	public constructor(obsolete_debuggerLinesAndColumnsStartAt1?: boolean, obsolete_isServer?: boolean) {
		super();

		const linesAndColumnsStartAt1 = typeof obsolete_debuggerLinesAndColumnsStartAt1 === 'boolean' ? obsolete_debuggerLinesAndColumnsStartAt1 : false;
		this._debuggerLinesStartAt1 = linesAndColumnsStartAt1;
		this._debuggerColumnsStartAt1 = linesAndColumnsStartAt1;
		this._debuggerPathsAreURIs = false;

		this._clientLinesStartAt1 = true;
		this._clientColumnsStartAt1 = true;
		this._clientPathsAreURIs = false;

		this._isServer = typeof obsolete_isServer === 'boolean' ? obsolete_isServer : false;

		this.on('close', () => {
			this.shutdown();
		});
		this.on('error', (error) => {
			this.shutdown();
		});
	}

	public setDebuggerPathFormat(format: string) {
		this._debuggerPathsAreURIs = format !== 'path';
	}

	public setDebuggerLinesStartAt1(enable: boolean) {
		this._debuggerLinesStartAt1 = enable;
	}

	public setDebuggerColumnsStartAt1(enable: boolean) {
		this._debuggerColumnsStartAt1 = enable;
	}

	public setRunAsServer(enable: boolean) {
		this._isServer = enable;
	}

	/**
	 * A virtual constructor...
	 */
	public static run(debugSession: typeof DebugSession) {
		runDebugAdapter(debugSession);
	}

	public shutdown(): void {
		if (this._isServer || this._isRunningInline()) {
			// shutdown ignored in server mode
		} else {
			// wait a bit before shutting down
			setTimeout(() => {
				process.exit(0);
			}, 100);
		}
	}

	protected sendErrorResponse(response: DebugProtocol.Response, codeOrMessage: number | DebugProtocol.Message, format?: string, variables?: any, dest: ErrorDestination = ErrorDestination.User): void {

		let msg : DebugProtocol.Message;
		if (typeof codeOrMessage === 'number') {
			msg = <DebugProtocol.Message> {
				id: <number> codeOrMessage,
				format: format
			};
			if (variables) {
				msg.variables = variables;
			}
			if (dest & ErrorDestination.User) {
				msg.showUser = true;
			}
			if (dest & ErrorDestination.Telemetry) {
				msg.sendTelemetry = true;
			}
		} else {
			msg = codeOrMessage;
		}

		response.success = false;
		response.message = DebugSession.formatPII(msg.format, true, msg.variables);
		if (!response.body) {
			response.body = { };
		}
		response.body.error = msg;

		this.sendResponse(response);
	}

	public runInTerminalRequest(args: DebugProtocol.RunInTerminalRequestArguments, timeout: number, cb: (response: DebugProtocol.RunInTerminalResponse) => void) {
		this.sendRequest('runInTerminal', args, timeout, cb as (r: DebugProtocol.Response) => void);
	}

	protected dispatchRequest(request: DebugProtocol.Request): void {

		const response = new Response(request);

		try {
			if (request.command === 'initialize') {
				var args = <DebugProtocol.InitializeRequestArguments> request.arguments;

				if (typeof args.linesStartAt1 === 'boolean') {
					this._clientLinesStartAt1 = args.linesStartAt1;
				}
				if (typeof args.columnsStartAt1 === 'boolean') {
					this._clientColumnsStartAt1 = args.columnsStartAt1;
				}

				if (args.pathFormat !== 'path') {
					this.sendErrorResponse(response, 2018, 'debug adapter only supports native paths', null, ErrorDestination.Telemetry);
				} else {
					const initializeResponse = <DebugProtocol.InitializeResponse> response;
					initializeResponse.body = {};
					this.initializeRequest(initializeResponse, args);
				}

			} else if (request.command === 'launch') {
				this.launchRequest(<DebugProtocol.LaunchResponse> response, request.arguments, request);

			} else if (request.command === 'attach') {
				this.attachRequest(<DebugProtocol.AttachResponse> response, request.arguments, request);

			} else if (request.command === 'disconnect') {
				this.disconnectRequest(<DebugProtocol.DisconnectResponse> response, request.arguments, request);

			} else if (request.command === 'terminate') {
				this.terminateRequest(<DebugProtocol.TerminateResponse> response, request.arguments, request);

			} else if (request.command === 'restart') {
				this.restartRequest(<DebugProtocol.RestartResponse> response, request.arguments, request);

			} else if (request.command === 'setBreakpoints') {
				this.setBreakPointsRequest(<DebugProtocol.SetBreakpointsResponse> response, request.arguments, request);

			} else if (request.command === 'setFunctionBreakpoints') {
				this.setFunctionBreakPointsRequest(<DebugProtocol.SetFunctionBreakpointsResponse> response, request.arguments, request);

			} else if (request.command === 'setExceptionBreakpoints') {
				this.setExceptionBreakPointsRequest(<DebugProtocol.SetExceptionBreakpointsResponse> response, request.arguments, request);

			} else if (request.command === 'configurationDone') {
				this.configurationDoneRequest(<DebugProtocol.ConfigurationDoneResponse> response, request.arguments, request);

			} else if (request.command === 'continue') {
				this.continueRequest(<DebugProtocol.ContinueResponse> response, request.arguments, request);

			} else if (request.command === 'next') {
				this.nextRequest(<DebugProtocol.NextResponse> response, request.arguments, request);

			} else if (request.command === 'stepIn') {
				this.stepInRequest(<DebugProtocol.StepInResponse> response, request.arguments, request);

			} else if (request.command === 'stepOut') {
				this.stepOutRequest(<DebugProtocol.StepOutResponse> response, request.arguments, request);

			} else if (request.command === 'stepBack') {
				this.stepBackRequest(<DebugProtocol.StepBackResponse> response, request.arguments, request);

			} else if (request.command === 'reverseContinue') {
				this.reverseContinueRequest(<DebugProtocol.ReverseContinueResponse> response, request.arguments, request);

			} else if (request.command === 'restartFrame') {
				this.restartFrameRequest(<DebugProtocol.RestartFrameResponse> response, request.arguments, request);

			} else if (request.command === 'goto') {
				this.gotoRequest(<DebugProtocol.GotoResponse> response, request.arguments, request);

			} else if (request.command === 'pause') {
				this.pauseRequest(<DebugProtocol.PauseResponse> response, request.arguments, request);

			} else if (request.command === 'stackTrace') {
				this.stackTraceRequest(<DebugProtocol.StackTraceResponse> response, request.arguments, request);

			} else if (request.command === 'scopes') {
				this.scopesRequest(<DebugProtocol.ScopesResponse> response, request.arguments, request);

			} else if (request.command === 'variables') {
				this.variablesRequest(<DebugProtocol.VariablesResponse> response, request.arguments, request);

			} else if (request.command === 'setVariable') {
				this.setVariableRequest(<DebugProtocol.SetVariableResponse> response, request.arguments, request);

			} else if (request.command === 'setExpression') {
				this.setExpressionRequest(<DebugProtocol.SetExpressionResponse> response, request.arguments, request);

			} else if (request.command === 'source') {
				this.sourceRequest(<DebugProtocol.SourceResponse> response, request.arguments, request);

			} else if (request.command === 'threads') {
				this.threadsRequest(<DebugProtocol.ThreadsResponse> response, request);

			} else if (request.command === 'terminateThreads') {
				this.terminateThreadsRequest(<DebugProtocol.TerminateThreadsResponse> response, request.arguments, request);

			} else if (request.command === 'evaluate') {
				this.evaluateRequest(<DebugProtocol.EvaluateResponse> response, request.arguments, request);

			} else if (request.command === 'stepInTargets') {
				this.stepInTargetsRequest(<DebugProtocol.StepInTargetsResponse> response, request.arguments, request);

			} else if (request.command === 'gotoTargets') {
				this.gotoTargetsRequest(<DebugProtocol.GotoTargetsResponse> response, request.arguments, request);

			} else if (request.command === 'completions') {
				this.completionsRequest(<DebugProtocol.CompletionsResponse> response, request.arguments, request);

			} else if (request.command === 'exceptionInfo') {
				this.exceptionInfoRequest(<DebugProtocol.ExceptionInfoResponse> response, request.arguments, request);

			} else if (request.command === 'loadedSources') {
				this.loadedSourcesRequest(<DebugProtocol.LoadedSourcesResponse> response, request.arguments, request);

			} else if (request.command === 'dataBreakpointInfo') {
				this.dataBreakpointInfoRequest(<DebugProtocol.DataBreakpointInfoResponse> response, request.arguments, request);

			} else if (request.command === 'setDataBreakpoints') {
				this.setDataBreakpointsRequest(<DebugProtocol.SetDataBreakpointsResponse> response, request.arguments, request);

			} else if (request.command === 'readMemory') {
				this.readMemoryRequest(<DebugProtocol.ReadMemoryResponse> response, request.arguments, request);

			} else if (request.command === 'writeMemory') {
				this.writeMemoryRequest(<DebugProtocol.WriteMemoryResponse> response, request.arguments, request);

			} else if (request.command === 'disassemble') {
				this.disassembleRequest(<DebugProtocol.DisassembleResponse> response, request.arguments, request);

			} else if (request.command === 'cancel') {
				this.cancelRequest(<DebugProtocol.CancelResponse> response, request.arguments, request);

			} else if (request.command === 'breakpointLocations') {
				this.breakpointLocationsRequest(<DebugProtocol.BreakpointLocationsResponse> response, request.arguments, request);

			} else if (request.command === 'setInstructionBreakpoints') {
				this.setInstructionBreakpointsRequest(<DebugProtocol.SetInstructionBreakpointsResponse> response, request.arguments, request);

			} else {
				this.customRequest(request.command, <DebugProtocol.Response> response, request.arguments, request);
			}
		} catch (e) {
			this.sendErrorResponse(response, 1104, '{_stack}', { _exception: e.message, _stack: e.stack }, ErrorDestination.Telemetry);
		}
	}

	protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {

		// This default debug adapter does not support conditional breakpoints.
		response.body.supportsConditionalBreakpoints = false;

		// This default debug adapter does not support hit conditional breakpoints.
		response.body.supportsHitConditionalBreakpoints = false;

		// This default debug adapter does not support function breakpoints.
		response.body.supportsFunctionBreakpoints = false;

		// This default debug adapter implements the 'configurationDone' request.
		response.body.supportsConfigurationDoneRequest = true;

		// This default debug adapter does not support hovers based on the 'evaluate' request.
		response.body.supportsEvaluateForHovers = false;

		// This default debug adapter does not support the 'stepBack' request.
		response.body.supportsStepBack = false;

		// This default debug adapter does not support the 'setVariable' request.
		response.body.supportsSetVariable = false;

		// This default debug adapter does not support the 'restartFrame' request.
		response.body.supportsRestartFrame = false;

		// This default debug adapter does not support the 'stepInTargets' request.
		response.body.supportsStepInTargetsRequest = false;

		// This default debug adapter does not support the 'gotoTargets' request.
		response.body.supportsGotoTargetsRequest = false;

		// This default debug adapter does not support the 'completions' request.
		response.body.supportsCompletionsRequest = false;

		// This default debug adapter does not support the 'restart' request.
		response.body.supportsRestartRequest = false;

		// This default debug adapter does not support the 'exceptionOptions' attribute on the 'setExceptionBreakpoints' request.
		response.body.supportsExceptionOptions = false;

		// This default debug adapter does not support the 'format' attribute on the 'variables', 'evaluate', and 'stackTrace' request.
		response.body.supportsValueFormattingOptions = false;

		// This debug adapter does not support the 'exceptionInfo' request.
		response.body.supportsExceptionInfoRequest = false;

		// This debug adapter does not support the 'TerminateDebuggee' attribute on the 'disconnect' request.
		response.body.supportTerminateDebuggee = false;

		// This debug adapter does not support delayed loading of stack frames.
		response.body.supportsDelayedStackTraceLoading = false;

		// This debug adapter does not support the 'loadedSources' request.
		response.body.supportsLoadedSourcesRequest = false;

		// This debug adapter does not support the 'logMessage' attribute of the SourceBreakpoint.
		response.body.supportsLogPoints = false;

		// This debug adapter does not support the 'terminateThreads' request.
		response.body.supportsTerminateThreadsRequest = false;

		// This debug adapter does not support the 'setExpression' request.
		response.body.supportsSetExpression = false;

		// This debug adapter does not support the 'terminate' request.
		response.body.supportsTerminateRequest = false;

		// This debug adapter does not support data breakpoints.
		response.body.supportsDataBreakpoints = false;

		/** This debug adapter does not support the 'readMemory' request. */
		response.body.supportsReadMemoryRequest = false;

		/** The debug adapter does not support the 'disassemble' request. */
		response.body.supportsDisassembleRequest = false;

		/** The debug adapter does not support the 'cancel' request. */
		response.body.supportsCancelRequest = false;

		/** The debug adapter does not support the 'breakpointLocations' request. */
		response.body.supportsBreakpointLocationsRequest = false;

		/** The debug adapter does not support the 'clipboard' context value in the 'evaluate' request. */
		response.body.supportsClipboardContext = false;

		/** The debug adapter does not support stepping granularities for the stepping requests. */
		response.body.supportsSteppingGranularity = false;

		/** The debug adapter does not support the 'setInstructionBreakpoints' request. */
		response.body.supportsInstructionBreakpoints = false;

		/** The debug adapter does not support 'filterOptions' on the 'setExceptionBreakpoints' request. */
		response.body.supportsExceptionFilterOptions = false;

		this.sendResponse(response);
	}

	protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
		this.shutdown();
	}

	protected launchRequest(response: DebugProtocol.LaunchResponse, args: DebugProtocol.LaunchRequestArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected attachRequest(response: DebugProtocol.AttachResponse, args: DebugProtocol.AttachRequestArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected terminateRequest(response: DebugProtocol.TerminateResponse, args: DebugProtocol.TerminateArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected restartRequest(response: DebugProtocol.RestartResponse, args: DebugProtocol.RestartArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected setFunctionBreakPointsRequest(response: DebugProtocol.SetFunctionBreakpointsResponse, args: DebugProtocol.SetFunctionBreakpointsArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected setExceptionBreakPointsRequest(response: DebugProtocol.SetExceptionBreakpointsResponse, args: DebugProtocol.SetExceptionBreakpointsArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments, request?: DebugProtocol.Request) : void {
		this.sendResponse(response);
	}

	protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments, request?: DebugProtocol.Request) : void {
		this.sendResponse(response);
	}

	protected stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments, request?: DebugProtocol.Request) : void {
		this.sendResponse(response);
	}

	protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments, request?: DebugProtocol.Request) : void {
		this.sendResponse(response);
	}

	protected stepBackRequest(response: DebugProtocol.StepBackResponse, args: DebugProtocol.StepBackArguments, request?: DebugProtocol.Request) : void {
		this.sendResponse(response);
	}

	protected reverseContinueRequest(response: DebugProtocol.ReverseContinueResponse, args: DebugProtocol.ReverseContinueArguments, request?: DebugProtocol.Request) : void {
		this.sendResponse(response);
	}

	protected restartFrameRequest(response: DebugProtocol.RestartFrameResponse, args: DebugProtocol.RestartFrameArguments, request?: DebugProtocol.Request) : void {
		this.sendResponse(response);
	}

	protected gotoRequest(response: DebugProtocol.GotoResponse, args: DebugProtocol.GotoArguments, request?: DebugProtocol.Request) : void {
		this.sendResponse(response);
	}

	protected pauseRequest(response: DebugProtocol.PauseResponse, args: DebugProtocol.PauseArguments, request?: DebugProtocol.Request) : void {
		this.sendResponse(response);
	}

	protected sourceRequest(response: DebugProtocol.SourceResponse, args: DebugProtocol.SourceArguments, request?: DebugProtocol.Request) : void {
		this.sendResponse(response);
	}

	protected threadsRequest(response: DebugProtocol.ThreadsResponse, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected terminateThreadsRequest(response: DebugProtocol.TerminateThreadsResponse, args: DebugProtocol.TerminateThreadsArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected setVariableRequest(response: DebugProtocol.SetVariableResponse, args: DebugProtocol.SetVariableArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected setExpressionRequest(response: DebugProtocol.SetExpressionResponse, args: DebugProtocol.SetExpressionArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected stepInTargetsRequest(response: DebugProtocol.StepInTargetsResponse, args: DebugProtocol.StepInTargetsArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected gotoTargetsRequest(response: DebugProtocol.GotoTargetsResponse, args: DebugProtocol.GotoTargetsArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected completionsRequest(response: DebugProtocol.CompletionsResponse, args: DebugProtocol.CompletionsArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected exceptionInfoRequest(response: DebugProtocol.ExceptionInfoResponse, args: DebugProtocol.ExceptionInfoArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected loadedSourcesRequest(response: DebugProtocol.LoadedSourcesResponse, args: DebugProtocol.LoadedSourcesArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected dataBreakpointInfoRequest(response: DebugProtocol.DataBreakpointInfoResponse, args: DebugProtocol.DataBreakpointInfoArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected setDataBreakpointsRequest(response: DebugProtocol.SetDataBreakpointsResponse, args: DebugProtocol.SetDataBreakpointsArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected readMemoryRequest(response: DebugProtocol.ReadMemoryResponse, args: DebugProtocol.ReadMemoryArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected writeMemoryRequest(response: DebugProtocol.WriteMemoryResponse, args: DebugProtocol.WriteMemoryArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected disassembleRequest(response: DebugProtocol.DisassembleResponse, args: DebugProtocol.DisassembleArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected cancelRequest(response: DebugProtocol.CancelResponse, args: DebugProtocol.CancelArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected breakpointLocationsRequest(response: DebugProtocol.BreakpointLocationsResponse, args: DebugProtocol.BreakpointLocationsArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	protected setInstructionBreakpointsRequest(response: DebugProtocol.SetInstructionBreakpointsResponse, args: DebugProtocol.SetInstructionBreakpointsArguments, request?: DebugProtocol.Request): void {
		this.sendResponse(response);
	}

	/**
	 * Override this hook to implement custom requests.
	 */
	protected customRequest(command: string, response: DebugProtocol.Response, args: any, request?: DebugProtocol.Request): void {
		this.sendErrorResponse(response, 1014, 'unrecognized request', null, ErrorDestination.Telemetry);
	}

	//---- protected -------------------------------------------------------------------------------------------------

	protected convertClientLineToDebugger(line: number): number {
		if (this._debuggerLinesStartAt1) {
			return this._clientLinesStartAt1 ? line : line + 1;
		}
		return this._clientLinesStartAt1 ? line - 1 : line;
	}

	protected convertDebuggerLineToClient(line: number): number {
		if (this._debuggerLinesStartAt1) {
			return this._clientLinesStartAt1 ? line : line - 1;
		}
		return this._clientLinesStartAt1 ? line + 1 : line;
	}

	protected convertClientColumnToDebugger(column: number): number {
		if (this._debuggerColumnsStartAt1) {
			return this._clientColumnsStartAt1 ? column : column + 1;
		}
		return this._clientColumnsStartAt1 ? column - 1 : column;
	}

	protected convertDebuggerColumnToClient(column: number): number {
		if (this._debuggerColumnsStartAt1) {
			return this._clientColumnsStartAt1 ? column : column - 1;
		}
		return this._clientColumnsStartAt1 ? column + 1 : column;
	}

	protected convertClientPathToDebugger(clientPath: string): string {
		if (this._clientPathsAreURIs !== this._debuggerPathsAreURIs) {
			if (this._clientPathsAreURIs) {
				return DebugSession.uri2path(clientPath);
			} else {
				return DebugSession.path2uri(clientPath);
			}
		}
		return clientPath;
	}

	protected convertDebuggerPathToClient(debuggerPath: string): string {
		if (this._debuggerPathsAreURIs !== this._clientPathsAreURIs) {
			if (this._debuggerPathsAreURIs) {
				return DebugSession.uri2path(debuggerPath);
			} else {
				return DebugSession.path2uri(debuggerPath);
			}
		}
		return debuggerPath;
	}

	//---- private -------------------------------------------------------------------------------

	private static path2uri(path: string): string {

		if (process.platform === 'win32') {
			if (/^[A-Z]:/.test(path)) {
				path = path[0].toLowerCase() + path.substr(1);
			}
			path = path.replace(/\\/g, '/');
		}
		path = encodeURI(path);

		let uri = new URL(`file:`);	// ignore 'path' for now
		uri.pathname = path;	// now use 'path' to get the correct percent encoding (see https://url.spec.whatwg.org)
		return uri.toString();
	}

	private static uri2path(sourceUri: string): string {

		let uri = new URL(sourceUri);
		let s = decodeURIComponent(uri.pathname);
		if (process.platform === 'win32') {
			if (/^\/[a-zA-Z]:/.test(s)) {
				s = s[1].toLowerCase() + s.substr(2);
			}
			s = s.replace(/\//g, '\\');
		}
		return s;
	}

	private static _formatPIIRegexp = /{([^}]+)}/g;

	/*
	* If argument starts with '_' it is OK to send its value to telemetry.
	*/
	private static formatPII(format:string, excludePII: boolean, args: {[key: string]: string}): string {
		return format.replace(DebugSession._formatPIIRegexp, function(match, paramName) {
			if (excludePII && paramName.length > 0 && paramName[0] !== '_') {
				return match;
			}
			return args[paramName] && args.hasOwnProperty(paramName) ?
				args[paramName] :
				match;
		})
	}
}
