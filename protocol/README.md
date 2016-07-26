# VS Code Debug Protocol

[![NPM Version](https://img.shields.io/npm/v/vscode-debugprotocol.svg)](https://npmjs.org/package/vscode-debugprotocol)
[![NPM Downloads](https://img.shields.io/npm/dm/vscode-debugprotocol.svg)](https://npmjs.org/package/vscode-debugprotocol)

This npm module contains declarations for the json-based Visual Studio Code debug protocol.

## History

* 1.11.x:
  * Adds a new optional attribute `mimeType` to the `SourceResponse`.
  * Adds a new optional attribute `sourceModified` to the `SetBreakpointsArguments` that indicates that the underlying source has been modified which results in new breakpoint locations.
  * Adds a new optional attribute `supportsVariableType` to `InitializeRequestArguments`. True indicates that the client shows the variable's type attribute in the UI.
  * Adds optional 'type' attribute to the `EvaluateResponse`.
  * Introduces the `RestartFrameRequest` and a corresponding `supportsRestartFrame` capability.
  * Introduces a `ContinuedEvent` so that a debug adapter can explicit trigger that a thread has continued execution.
  * Adds support for step in targets (request `StepInTargetsRequest`, type `StepInTarget`, capability `supportsStepInTargetsRequest`)
  * Adds support for goto targets (requests `SotoTargetsRequest` and `GotoRequest`, type `GotoTarget`, capability `supportsGotoTargetsRequest`)
  * Adds support for variable paging, that is named and indexed children of a variable can be requested in pages (chunks).
  * Adds experimental support for completion proposals.

* 1.10.x:
  * Introduces a `stepBack` request and a corresponding `supportsStepBack` capability.
  * Introduces the type `Module`, a `ModuleRequest`, and a `ModuleEvent`
  * Introduces the `setVariableRequest`
  * Adds new optional attributes `type` and `kind` for a `Variable`.
  * Adds optional attributes `endLine` and `endColumn` to `StackFrame` and `Breakpoint` types.

* 1.9.x:
  * Introduces a `allThreadsContinued` attribute on the `ContinueResponse` to indicate that all threads are continued and not only the one specified.

* 1.8.x:
  * Introduces `ExceptionBreakpointsFilter` and fixed corresponding capability.
  * Adds optional `noDebug` attribute to `LaunchRequestArguments`.
  * Adds optional `startFrame` argument to `StackTraceArguments` to allow for paging.
  * Adds optional `totalFrames` argument to `StackTraceResponse` to allow for paging.
  * Improve comment: `InitializedEvent` must not be sent before `InitializeRequest` has returned its result.

* 1.7.x:
  * Adds optional `url` and `urlLabel` attributes to the error messages. The frontend will show this as a UI to open additional information in a browser.
  * Added option `default` attribute to the `exceptionBreakpointFilters` capability.
  * Adds optional attribute `allThreadsStopped` to the `StoppedEvent` to indicate that all threads are stopped (and not only the one mentioned in the event).

* 1.6.x:
  * A boolean `supportsConditionalBreakpoints` in `Capabilities` indicates whether the debug adapter supports conditional breakpoints.
  * Adds an optional `exceptionBreakpointFilters` capability that lists the filters available for the `setExceptionBreakpoints` request.
  * Adds an optional `restart` attribute to the `TerminatedEvent` which can be used to request a restart of the debug session.

* 1.5.x:
  * A boolean `supportsFunctionBreakpoints` in `Capabilities` indicates whether the debug adapter implements the function breakpoints.
  * Renamed `supportEvaluateForHovers` in `Capabilities` to `supportsEvaluateForHovers`.

* 1.4.x:
  * Made the `body` of the `InitializeResponse` optional (for backward compatibility).

* 1.3.x: Version introduces support for feature negotiation.
  * The `InitializeResponse` has now attributes for these features:
    * A boolean `supportsConfigurationDoneRequest` indicates whether the debug adapter implements the `ConfigurationDoneRequest`.
    * A boolean `supportEvaluateForHovers` indicates whether the debug adapter supports a side effect free `EvaluateRequest`.
  * Adds an optional `data` attribute to the `OutputEvent` and a `telemetry` category.
  * Adds a new context type `hover` to the `context` attribute of the `EvaluateArguments`.

* 1.2.x: Version adds a new request:
  * Introduces a `ConfigurationDoneRequest` that VS Code sends to indicate that the configuration of the debug session has finished and that debugging can start.

* 1.1.x: Version adds support for conditional breakpoints and breakpoints in virtual documents:
  * Type `Source` supports optional `origin` attribute to provide information that is shown in the debug UI.
  * Type `Source` supports an optional `adapterData` attribute that the VS Code debug UI will transparently persists for breakpoints.
  * Introduces type `SourceBreakpoint` that makes it possible to provide `column` and `condition` information when specifying a breakpoint.

* 1.0.1: Initial version of the debug protocol

## License

[MIT](https://github.com/Microsoft/vscode-languageserver-node/blob/master/License.txt)
