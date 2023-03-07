import type {
	GameState,
	POINT,
} from './game';

export type PLAYER_INDEX =
	0
	| 1;

export const MAX_PLAYERS = 2;

export function get_next_player_index(index: number): PLAYER_INDEX {
	const next = index + 1;
	return next >= MAX_PLAYERS ? 0 : next as PLAYER_INDEX;
}

export type AllPlayer<T> = [T, T];

export interface PlayerInfo {
	index: PLAYER_INDEX;
	name: string;
	online: boolean,
	ready: boolean,
}

export interface GameServerEventsMap {
	'index': (index: PLAYER_INDEX) => void;
	'players': (list: PlayerInfo[]) => void;
	'state': (state: GameState) => void;
}

export interface PlayerClientEventsMap {
	'fetch_player': () => PlayerInfo[];
	'fetch_state': () => GameState;
	'move': (point: POINT) => void;
	'ready': () => void;
}
