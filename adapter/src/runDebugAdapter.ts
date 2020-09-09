/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as Net from 'net';

import { DebugSession } from './debugSession';

export function runDebugAdapter(debugSession: typeof DebugSession) {

	// parse arguments
	let port = 0;
	const args = process.argv.slice(2);
	args.forEach(function (val, index, array) {
		const portMatch = /^--server=(\d{4,5})$/.exec(val);
		if (portMatch) {
			port = parseInt(portMatch[1], 10);
		}
	});

	if (port > 0) {
		// start as a server
		console.error(`waiting for debug protocol on port ${port}`);
		Net.createServer((socket) => {
			console.error('>> accepted connection from client');
			socket.on('end', () => {
				console.error('>> client connection closed\n');
			});
			const session = new debugSession(false, true);
			session.setRunAsServer(true);
			session.start(socket, socket);
		}).listen(port);
	} else {

		// start a session
		//console.error('waiting for debug protocol on stdin/stdout');
		const session = new debugSession(false);
		process.on('SIGTERM', () => {
			session.shutdown();
		});
		session.start(process.stdin, process.stdout);
	}
}
