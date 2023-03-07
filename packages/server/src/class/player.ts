import {
	derived,
	writable,
} from '@dishuostec/svelte-store/deep';
import {
	is_position_empty,
} from '@gomoku/common/src/game';
import type {
	POINT,
	ChessboardRow,
	Holding,
} from '@gomoku/common/src/game';
import type {
	PLAYER_INDEX,
	PlayerInfo,
} from '@gomoku/common/src/room';
import type { Writable } from 'svelte/store';


export class Player {
	readonly index: PLAYER_INDEX;
	readonly name: string;
	readonly ready = writable<boolean>(false);
	readonly online = writable<boolean>(true);
	readonly info = derived([this.ready, this.online], ([ready, online]) => {
		return {
			index: this.index,
			name: this.name,
			online,
			ready,
		} as PlayerInfo;
	});

	constructor(index) {
		this.index = index;
		this.name = `Player ${index + 1}`;

		// this.info.subscribe(d => {
		// 	console.log(d);
		// });
	}


	move(holding: Writable<Holding>, point: POINT) {
		holding.update(d => {
			if (!is_position_empty(d, point)) {
				return d;
			}

			const cloned = d.slice() as Holding;

			cloned[point.row] = cloned[point.row].slice() as ChessboardRow;
			cloned[point.row][point.col] = this.index;

			return cloned;
		});
	}

}
