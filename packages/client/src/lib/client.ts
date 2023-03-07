import { writable } from '@dishuostec/svelte-store';
import { io } from 'socket.io-client';
import { Game } from './game';

const url = location.host.replace(/:\d+/, '') + ':3001';
const socket = io(url, {
	transports: ['websocket'],
});

export const connection_state = writable<boolean>(false);

socket
	.on('connect', () => {
		connection_state.set(true);
	})
	.on('disconnect', () => {
		connection_state.set(false);
	});

export const game = new Game(socket);
