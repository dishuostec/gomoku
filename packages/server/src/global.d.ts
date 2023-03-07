import type {
	PlayerClientEventsMap,
	GameServerEventsMap,
} from '@gomoku/common/src/room';
import { Socket } from 'socket.io/dist/socket';

declare module 'http' {
	class IncomingMessage {
		session?: { id?: string };
	}
}

declare global {
	type GameClient = Socket<PlayerClientEventsMap, GameServerEventsMap>;
}
