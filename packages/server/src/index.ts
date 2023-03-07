import {
	Server,
	ServerOptions,
} from 'socket.io';
import * as cookie from 'cookie';
import { ulid } from 'ulid';

import { Room } from './class/room';

const room = new Room;

const options: Partial<ServerOptions> = {
	cookie: true,
	serveClient: false,
	pingTimeout: 1000,
	pingInterval: 1000,
	transports:['websocket'],
	allowRequest: async (req, callback) => {
		const cookies = cookie.parse(req.headers.cookie || '');
		const id = cookies.id;

		req.session = { id: id ?? ulid() };
		callback(null, room.canJoin() || room.joined(id));
	},
};

const io = new Server(options);

io.listen(3001);

io.engine.on('initial_headers', (headers, req) => {
	if (req.session) {
		headers['set-cookie'] = cookie.serialize('id', req.session.id, { sameSite: 'strict' });
	}
});

io.on('connection', (socket) => {
	if (!room.playerJoin(socket)) {
		socket.disconnect(true);
	}
});
