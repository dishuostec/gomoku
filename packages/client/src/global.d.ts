import type {
	PlayerClientEventsMap,
	GameServerEventsMap,
} from '@gomoku/common/src/room';
import { Socket } from 'socket.io-client';


declare global {
	type GameClient = Socket<GameServerEventsMap, PlayerClientEventsMap>;
}
