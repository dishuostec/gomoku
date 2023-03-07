import type {
	PLAYER_INDEX,
} from './room';
import type { NumberRange } from './types';

type POINTS_MIN_INDEX = 0;
type POINTS_MAX_INDEX = 14;
type POINTS_COUNT = 15;

type POINTS_VALID_INDEX = NumberRange<POINTS_MIN_INDEX, POINTS_MAX_INDEX>;

export type POINT = { row: POINTS_VALID_INDEX, col: POINTS_VALID_INDEX };

type POINT_EMPTY = null;
export type POINT_VALUE =
	POINT_EMPTY
	| PLAYER_INDEX;

type ArrayFixedLength<T, L extends number> =
	T[]
	& { length: L };

export type ChessboardRow = ArrayFixedLength<POINT_VALUE, POINTS_COUNT>;

type Chessboard = ArrayFixedLength<ChessboardRow, POINTS_COUNT>;

export type Holding = Chessboard;

const _row = Array<null>(15).fill(null) as ArrayFixedLength<POINT_EMPTY, POINTS_COUNT>;

export function create_holding(): Holding {
	return _row.map(_value => {
		return _row.slice() as ChessboardRow;
	}) as Chessboard;
}

export function is_win(
	holding: Holding,
	point: POINT,
): boolean {

	const expect = holding[point.row][point.col];
	if (expect == null) {return false;}

	if (count_horizontal(holding, point, expect) >= 5) {
		return true;
	}

	if (count_vertical(holding, point, expect) >= 5) {
		return true;
	}

	if (count_slash(holding, point, expect) >= 5) {
		return true;
	}

	if (count_backslash(holding, point, expect) >= 5) {
		return true;
	}

	return false;
}

export function is_position_empty(
	holding: Holding,
	point: POINT,
): boolean {
	return holding[point.row][point.col] === null;
}

export function count_horizontal(
	holding: Holding,
	point: POINT,
	expect: PLAYER_INDEX,
): number {
	let length = 1;

	for (let i = point.col - 1; i >= 0; i--) {
		if (holding[point.row][i] === expect) {length++;} else {break;}
	}

	for (let i = point.col + 1; i <= 14; i++) {
		if (holding[point.row][i] === expect) {length++;} else {break;}
	}

	return length;
}

export function count_vertical(
	holding: Holding,
	point: POINT,
	expect: PLAYER_INDEX,
): number {
	let length = 1;

	for (let i = point.row - 1; i >= 0; i--) {
		if (holding[i][point.col] === expect) {length++;} else {break;}
	}

	for (let i = point.row + 1; i <= 14; i++) {
		if (holding[i][point.col] === expect) {length++;} else {break;}
	}

	return length;
}

export function count_backslash(
	holding: Holding,
	point: POINT,
	expect: PLAYER_INDEX,
) {
	let length = 1;

	for (let i = point.row - 1, j = point.col - 1; i >= 0 && j >= 0; i--, j--) {
		if (holding[i][j] === expect) {length++;} else {break;}
	}

	for (let i = point.row + 1, j = point.col + 1; i <= 14 && j <= 14; i++, j++) {
		if (holding[i][j] === expect) {length++;} else {break;}
	}

	return length;
}

export function count_slash(
	holding: Holding,
	point: POINT,
	expect: PLAYER_INDEX,
): number {
	let length = 1;

	for (let i = point.row - 1, j = point.col + 1; i >= 0 && j <= 14; i--, j++) {
		if (holding[i][j] === expect) {length++;} else {break;}
	}

	for (let i = point.row + 1, j = point.col - 1; i <= 14 && j >= 0; i++, j--) {
		if (holding[i][j] === expect) {length++;} else {break;}
	}

	return length;
}

export function is_full(holding: Holding): boolean {
	const has_empty_position = holding.findIndex(row => row.findIndex(pos => pos === null) >= 0) >= 0;

	return !has_empty_position;
}

export enum GameStatus {
	Waiting,
	Playing,
	End,
}

export interface GameWaitingState {
	status: GameStatus.Waiting,
}

export interface GamePlayingState {
	status: GameStatus.Playing;
	player: {
		first: PLAYER_INDEX;
		current: PLAYER_INDEX;
	},
	holding: Holding;
	last: POINT | null;
}

export interface GameEndState {
	status: GameStatus.End;
	player: {
		first: PLAYER_INDEX;
		win: PLAYER_INDEX | null;
	},
	holding: Holding;
	last: POINT | null;
}

export type GameState =
	GameWaitingState
	| GamePlayingState
	| GameEndState;


