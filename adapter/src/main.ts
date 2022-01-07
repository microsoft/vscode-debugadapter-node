/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
	DebugSession,
	InitializedEvent, TerminatedEvent, ExitedEvent, StoppedEvent, ContinuedEvent, OutputEvent, ThreadEvent, BreakpointEvent, ModuleEvent,
		LoadedSourceEvent, CapabilitiesEvent, ProgressStartEvent, ProgressUpdateEvent, ProgressEndEvent, InvalidatedEvent, MemoryEvent,
	Thread, StackFrame, Scope, Variable,
	Breakpoint, Source, Module, CompletionItem,
	ErrorDestination
} from './debugSession';
import {LoggingDebugSession} from './loggingDebugSession';
import * as Logger from './logger';
import { Event, Response } from './messages';
import { Handles } from './handles';

const logger = Logger.logger;

export {
	DebugSession,
	LoggingDebugSession,
	Logger,
	logger,
	InitializedEvent, TerminatedEvent, ExitedEvent, StoppedEvent, ContinuedEvent, OutputEvent, ThreadEvent, BreakpointEvent, ModuleEvent,
		LoadedSourceEvent, CapabilitiesEvent, ProgressStartEvent, ProgressUpdateEvent, ProgressEndEvent, InvalidatedEvent, MemoryEvent,
	Thread, StackFrame, Scope, Variable,
	Breakpoint, Source, Module, CompletionItem,
	ErrorDestination,
	Event, Response,
	Handles
}
