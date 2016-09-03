/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/***********************************************************
 * Auto-generated from json schema. Do not edit manually.
 ***********************************************************/

/** A json schema for the VS Code Debug Protocol */
export declare module debugProtocol {

	/** Base class of requests, responses, and events. */
	export interface ProtocolMessage {
		/** Sequence number. */
		seq: number;
		/** One of 'request', 'response', or 'event'. */
		type: 'request' | 'response' | 'event';
	}

	/** Request. */
	export interface Request extends ProtocolMessage {
		type: 'request';
		/** The command to execute. */
		command: string;
		/** Object containing arguments for the command. */
		arguments?: {};
	}

	/** Event. */
	export interface Event extends ProtocolMessage {
		type: 'event';
		/** Type of event. */
		event: string;
		/** Event-specific information. */
		body?: {};
	}

	/** Response to a request. */
	export interface Response extends ProtocolMessage {
		type: 'response';
		/** Sequence number of the corresponding request. */
		request_seq: number;
		/** Outcome of the request. */
		success: boolean;
		/** The command requested. */
		command: string;
		/** Contains error message if success == false. */
		message?: string;
		/** Contains request result if success is true and optional error details if success is false. */
		body?: {};
	}

	/** Event message for 'initialized' event type.
		This event indicates that the debug adapter is ready to accept configuration requests (e.g. SetBreakpointsRequest, SetExceptionBreakpointsRequest).
		A debug adapter is expected to send this event when it is ready to accept configuration requests (but not before the InitializeRequest has finished).
		The sequence of events/requests is as follows:
		- adapters sends InitializedEvent (after the InitializeRequest has returned)
		- frontend sends zero or more SetBreakpointsRequest
		- frontend sends one SetFunctionBreakpointsRequest
		- frontend sends a SetExceptionBreakpointsRequest if one or more exceptionBreakpointFilters have been defined (or if supportsConfigurationDoneRequest is not defined or false)
		- frontend sends other future configuration requests
		- frontend sends one ConfigurationDoneRequest to indicate the end of the configuration
	*/
	export interface InitializedEvent extends Event {
		event: 'initialized';
	}

	/** Event message for 'stopped' event type.
		The event indicates that the execution of the debuggee has stopped due to some condition.
		This can be caused by a break point previously set, a stepping action has completed, by executing a debugger statement etc.
	*/
	export interface StoppedEvent extends Event {
		event: 'stopped';
		body: {
			/** The reason for the event (such as: 'step', 'breakpoint', 'exception', 'pause'). This string is shown in the UI. */
			reason: 'step' | 'breakpoint' | 'exception' | 'pause';
			/** The thread which was stopped. */
			threadId?: number;
			/** Additional information. E.g. if reason is 'exception', text contains the exception name. This string is shown in the UI. */
			text?: string;
			/** If allThreadsStopped is true, a debug adapter can announce that all threads have stopped.
				*  The client should use this information to enable that all threads can be expanded to access their stacktraces.
				*  If the attribute is missing or false, only the thread with the given threadId can be expanded.
			*/
			allThreadsStopped?: boolean;
		};
	}

	/** Event message for 'continued' event type.
		The event indicates that the execution of the debuggee has continued.
		Please note: a debug adapter is not expected to send this event in response to a request that implies that execution continues, e.g. 'launch' or 'continue'.
		It is only necessary to send a ContinuedEvent if there was no previous request that implied this.
	*/
	export interface ContinuedEvent extends Event {
		event: 'continued';
		body: {
			/** The thread which was continued. */
			threadId: number;
			/** If allThreadsContinued is true, a debug adapter can announce that all threads have continued. */
			allThreadsContinued?: boolean;
		};
	}

	/** Event message for 'exited' event type.
		The event indicates that the debuggee has exited.
	*/
	export interface ExitedEvent extends Event {
		event: 'exited';
		body: {
			/** The exit code returned from the debuggee. */
			exitCode: number;
		};
	}

	/** Event message for 'terminated' event types.
		The event indicates that debugging of the debuggee has terminated.
	*/
	export interface TerminatedEvent extends Event {
		event: 'terminated';
		body?: {
			/** A debug adapter may set 'restart' to true to request that the front end restarts the session. */
			restart?: boolean;
		};
	}

	/** Event message for 'thread' event type.
		The event indicates that a thread has started or exited.
	*/
	export interface ThreadEvent extends Event {
		event: 'thread';
		body: {
			/** The reason for the event (such as: 'started', 'exited'). */
			reason: 'started' | 'exited';
			/** The identifier of the thread. */
			threadId: number;
		};
	}

	/** Event message for 'output' event type.
		The event indicates that the target has produced output.
	*/
	export interface OutputEvent extends Event {
		event: 'output';
		body: {
			/** The category of output (such as: 'console', 'stdout', 'stderr', 'telemetry'). If not specified, 'console' is assumed. */
			category?: 'console' | 'stdout' | 'stderr' | 'telemetry';
			/** The output to report. */
			output: string;
			/** Optional data to report. For the 'telemetry' category the data will be sent to telemetry, for the other categories the data is shown in JSON format. */
			data?: {};
		};
	}

	/** Event message for 'breakpoint' event type.
		The event indicates that some information about a breakpoint has changed.
	*/
	export interface BreakpointEvent extends Event {
		event: 'breakpoint';
		body: {
			/** The reason for the event (such as: 'changed', 'new'). */
			reason: 'changed' | 'new';
			/** The breakpoint. */
			breakpoint: Breakpoint;
		};
	}

	/** Event message for 'module' event type.
		The event indicates that some information about a module has changed.
	*/
	export interface ModuleEvent extends Event {
		event: 'module';
		body: {
			/** The reason for the event. */
			reason: 'new' | 'changed' | 'removed';
			/** The new, changed, or removed module. In case of 'removed' only the module id is used. */
			module: Module;
		};
	}

	/** runInTerminal request; value of command field is 'runInTerminal'.
		With this request a debug adapter can run a command in a terminal.
	*/
	export interface RunInTerminalRequest extends Request {
		command: 'runInTerminal';
		arguments: RunInTerminalRequestArguments;
	}

	/** Arguments for 'runInTerminal' request. */
	export interface RunInTerminalRequestArguments {
		/** What kind of terminal to launch. */
		kind?: 'integrated' | 'external';
		/** Optional title of the terminal. */
		title?: string;
		/** Working directory of the command. */
		cwd: string;
		/** List of arguments. The first argument is the command to run. */
		args: string[];
		/** Environment key-value pairs that are added to the default environment. */
		env?: {};
	}

	/** Response to Initialize request. */
	export interface RunInTerminalResponse extends Response {
		body: {
			/** The process ID. */
			processId?: number;
		};
	}

	/** Information about the capabilities of a debug adapter. */
	export interface Capabilities {
		/** The debug adapter supports the configurationDoneRequest. */
		supportsConfigurationDoneRequest?: boolean;
		/** The debug adapter supports functionBreakpoints. */
		supportsFunctionBreakpoints?: boolean;
		/** The debug adapter supports conditionalBreakpoints. */
		supportsConditionalBreakpoints?: boolean;
		/** The debug adapter supports a (side effect free) evaluate request for data hovers. */
		supportsEvaluateForHovers?: boolean;
		/** Available filters for the setExceptionBreakpoints request. */
		exceptionBreakpointFilters?: ExceptionBreakpointsFilter[];
		/** The debug adapter supports stepping back. */
		supportsStepBack?: boolean;
		/** The debug adapter supports setting a variable to a value. */
		supportsSetVariable?: boolean;
		/** The debug adapter supports restarting a frame. */
		supportsRestartFrame?: boolean;
		/** The debug adapter supports the gotoTargetsRequest. */
		supportsGotoTargetsRequest?: boolean;
		/** The debug adapter supports the stepInTargetsRequest. */
		supportsStepInTargetsRequest?: boolean;
		/** The debug adapter supports the completionsRequest. */
		supportsCompletionsRequest?: boolean;
	}

	/** A Module object represents a row in the modules view.
		Two attributes are mandatory: an id identifies a module in the modules view and is used in a ModuleEvent for identifying a module for adding, updating or deleting.
		The name is used to minimally render the module in the UI.
		
		Additional attributes can be added to the module. They will show up in the module View if they have a corresponding ColumnDescriptor.
		
		To avoid an unnecessary proliferation of additional attributes with similar semantics but different names we recommend to re-use attributes from the 'recommended' list below first, and only introduce new attributes if nothing appropriate could be found.
	*/
	export interface Module {
		/** Unique identifier for the module. */
		id: number;
		/** A name of the module. */
		name: string;
		/** optional but recommended attributes.
			always try to use these first before introducing additional attributes.
			
			Logical full path to the module. The exact definition is implementation defined, but usually this would be a full path to the on-disk file for the module.
		*/
		path?: string;
		/** True if the module is optimized. */
		isOptimized?: boolean;
		/** True if the module is considered 'user code' by a debugger that supports 'Just My Code'. */
		isUserCode?: boolean;
		/** Version of Module. */
		version?: string;
		/** User understandable description of if symbols were found for the module (ex: 'Symbols Loaded', 'Symbols not found', etc. */
		symbolStatus?: string;
		/** Logical full path to the symbol file. The exact definition is implementation defined. */
		symbolFilePath?: string;
		/** Module created or modified. */
		dateTimeStamp?: string;
		/** Address range covered by this module. */
		addressRange?: string;
	}

	/** An ExceptionBreakpointsFilter is shown in the UI as an option for configuring how exceptions are dealt with. */
	export interface ExceptionBreakpointsFilter {
		/** The internal ID of the filter. This value is passed to the setExceptionBreakpoints request. */
		filter: string;
		/** The name of the filter. This will be shown in the UI. */
		label: string;
		/** Initial value of the filter. If not specified a value 'false' is assumed. */
		default?: boolean;
	}

	/** A Source is a descriptor for source code. It is returned from the debug adapter as part of a StackFrame and it is used by clients when specifying breakpoints. */
	export interface Source {
		/** The short name of the source. Every source returned from the debug adapter has a name. When specifying a source to the debug adapter this name is optional. */
		name?: string;
		/** The long (absolute) path of the source. It is not guaranteed that the source exists at this location. */
		path?: string;
		/** If sourceReference > 0 the contents of the source can be retrieved through the SourceRequest. A sourceReference is only valid for a session, so it must not be used to persist a source. */
		sourceReference?: boolean;
		/** The (optional) origin of this source: possible values 'internal module', 'inlined content from source map', etc. */
		origin?: boolean;
		/** Optional data that a debug adapter might want to loop through the client. The client should leave the data intact and persist it across sessions. The client should not interpret the data. */
		adapterData?: boolean;
	}

	/**  Information about a Breakpoint created in setBreakpoints or setFunctionBreakpoints. */
	export interface Breakpoint {
		/** An optional unique identifier for the breakpoint. */
		id?: number;
		/** If true breakpoint could be set (but not necessarily at the desired location). */
		verified: boolean;
		/** An optional message about the state of the breakpoint. This is shown to the user and can be used to explain why a breakpoint could not be verified. */
		message?: string;
		/** The start line of the actual range covered by the breakpoint. */
		source?: Source;
		/** The start line of the actual range covered by the breakpoint. */
		line?: number;
		/** An optional start column of the actual range covered by the breakpoint. */
		column?: number;
		/** An optional end line of the actual range covered by the breakpoint. */
		endLine?: number;
		/** An optional end column of the actual range covered by the breakpoint. If no end line is given, then the end column is assumed to be in the start line. */
		endColumn?: number;
	}
}

