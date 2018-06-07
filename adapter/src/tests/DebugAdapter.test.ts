/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as assert from 'assert';
import {DebugSession} from '../debugSession';

class TestDebugSession extends DebugSession {

	constructor() {
		super();
	}

	public convertClientPath2Debugger(clientPath: string): string {
		return this.convertClientPathToDebugger(clientPath);
	}

	public convertDebuggerPath2Client(debuggerPath: string): string {
		return this.convertDebuggerPathToClient(debuggerPath);
	}
}

suite('URI', () => {

	let da: TestDebugSession;

	setup( () => {
		da = new TestDebugSession();
	});

	teardown( () => {
		da.stop();
	} );

	suite('file', () => {

		test('convertClientPathToDebugger', () => {

			da.setDebuggerPathFormat('url');

			assert.equal(da.convertClientPath2Debugger('/abc/test.js'), 'file:///abc/test.js');

			assert.equal(da.convertClientPath2Debugger('/abc/foo bar.js'), 'file:///abc/foo%20bar.js');
			assert.equal(da.convertClientPath2Debugger('/abc/foo%bar.js'), 'file:///abc/foo%25bar.js');
			assert.equal(da.convertClientPath2Debugger('/abc/föö bär.js'), 'file:///abc/f%C3%B6%C3%B6%20b%C3%A4r.js');

			// 'path' percent-encode set
			assert.equal(da.convertClientPath2Debugger('/abc/foo{bar.js'), 'file:///abc/foo%7Bbar.js');
			assert.equal(da.convertClientPath2Debugger('/abc/foo}bar.js'), 'file:///abc/foo%7Dbar.js');
			assert.equal(da.convertClientPath2Debugger('/abc/foo#bar.js'), 'file:///abc/foo%23bar.js');
			assert.equal(da.convertClientPath2Debugger('/abc/foo?bar.js'), 'file:///abc/foo%3Fbar.js');

			// not percent-encoded
			assert.equal(da.convertClientPath2Debugger('/abc/foo:bar.js'), 'file:///abc/foo:bar.js');
			assert.equal(da.convertClientPath2Debugger('/abc/foo+bar.js'), 'file:///abc/foo+bar.js');	// see https://github.com/Microsoft/vscode-debugadapter-node/issues/182
			assert.equal(da.convertClientPath2Debugger('/abc/foo_bar.js'), 'file:///abc/foo_bar.js');
			assert.equal(da.convertClientPath2Debugger('/abc/foo@bar.js'), 'file:///abc/foo@bar.js');

			if (process.platform === 'win32') {
				// see https://github.com/Microsoft/vscode-debugadapter-node/issues/#159
				assert.equal(da.convertClientPath2Debugger('c:\\Users\\u\\test.js'), 'file:///c:/Users/u/test.js');

				// drive letters are normalized to lower case
				assert.equal(da.convertClientPath2Debugger('C:\\Users\\u\\test.js'), 'file:///c:/Users/u/test.js');
			}
		});

		test('convertDebuggerPathToClient', () => {

			da.setDebuggerPathFormat('url');

			assert.equal(da.convertDebuggerPath2Client('file:///abc/test.js'), '/abc/test.js');

			assert.equal(da.convertDebuggerPath2Client('file:///abc/foo%20bar.js'), '/abc/foo bar.js');
			assert.equal(da.convertDebuggerPath2Client('file:///abc/foo%25bar.js'), '/abc/foo%bar.js');
			assert.equal(da.convertDebuggerPath2Client('file:///abc/f%C3%B6%C3%B6%20b%C3%A4r.js'), '/abc/föö bär.js');

			// 'path' percent-encode set
			assert.equal(da.convertDebuggerPath2Client('file:///abc/foo%7Bbar.js'), '/abc/foo{bar.js');
			assert.equal(da.convertDebuggerPath2Client('file:///abc/foo%7Dbar.js'), '/abc/foo}bar.js');
			assert.equal(da.convertDebuggerPath2Client('file:///abc/foo%23bar.js'), '/abc/foo#bar.js');
			assert.equal(da.convertDebuggerPath2Client('file:///abc/foo%3Fbar.js'), '/abc/foo?bar.js');

			// not percent-encoded
			assert.equal(da.convertDebuggerPath2Client('file:///abc/foo:bar.js'), '/abc/foo:bar.js');
			assert.equal(da.convertDebuggerPath2Client('file:///abc/foo+bar.js'), '/abc/foo+bar.js');	//see https://github.com/Microsoft/vscode-debugadapter-node/issues/182
			assert.equal(da.convertDebuggerPath2Client('file:///abc/foo_bar.js'), '/abc/foo_bar.js');
			assert.equal(da.convertDebuggerPath2Client('file:///abc/foo@bar.js'), '/abc/foo@bar.js');

			if (process.platform === 'win32') {
				// see https://github.com/Microsoft/vscode-debugadapter-node/issues/#159
				assert.equal(da.convertDebuggerPath2Client('file:///c:/Users/u/Apex%20Debugger%20sample/blah.cls'), 'c:\\Users\\u\\Apex Debugger sample\\blah.cls');

				// drive letter casing are preserved
				assert.equal(da.convertClientPath2Debugger('file:///C:/Users/u/test.js'), 'C:\\Users\\u\\test.js');
				assert.equal(da.convertClientPath2Debugger('file:///c:/Users/u/test.js'), 'c:\\Users\\u\\test.js');
			}

		});

	});

});
