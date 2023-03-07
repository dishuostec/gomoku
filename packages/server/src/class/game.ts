import {
	derived,
	writable,
} from '@dishuostec/svelte-store/deep';
import {
	record,
	RecordStore,
} from '@dishuostec/svelte-store/extends/record';
import {
	GameState,
	GameStatus,
	is_win,
	Holding,
	is_full,
	create_holding,
	POINT,
	is_position_empty,
} from '@gomoku/common/src/game';
import { NanoEvents } from '@gomoku/common/src/NanoEvents';
import {
	GameServerEventsMap,
	get_next_player_index,
	MAX_PLAYERS,
	PLAYER_INDEX,
	PlayerClientEventsMap,
	PlayerInfo,
} from '@gomoku/common/src/room';
import type {
	CombineString,
	PrependParam,
} from '@gomoku/common/src/types';
import {
	get,
} from 'svelte/store';
import { onceStore } from '../helpers';
import { Player } from './player';

type RoundStatePlayer = {
	first: PLAYER_INDEX | null;
	current: PLAYER_INDEX | null;
	win: PLAYER_INDEX | null;
};

type RoundStatePlayerStore = RecordStore<RoundStatePlayer, RoundStatePlayer>;


interface EventsMap {
	[event: string]: any;
}

type ConvertEventMap<Map extends EventsMap, Prefix extends string = '', Suffix extends string = '', Append extends any = never> = {
	[Ev in keyof Map as Ev extends string ? CombineString<Ev, Prefix, Suffix> : never]: [Append] extends [never] ? Map[Ev] : PrependParam<Append, Map[Ev]>;
}

type GameServerEventsMapSolo<Map extends EventsMap> = ConvertEventMap<Map, 'solo.', '', Player>;
type GameServerEventsMapBroadcast<Map extends EventsMap> = ConvertEventMap<Map, 'broadcast.'>;
type GameServerEventsMapBroadcastExclude<Map extends EventsMap> = ConvertEventMap<Map, 'broadcast.', '.exclude', Player>;

type PlayerClientEventsMapInternal<Map extends EventsMap> = ConvertEventMap<Map, 'client.', '', Player>;


type EmitEventsMap =
	GameServerEventsMapSolo<GameServerEventsMap>
	& GameServerEventsMapBroadcast<GameServerEventsMap>
	& GameServerEventsMapBroadcastExclude<GameServerEventsMap>
	& PlayerClientEventsMapInternal<PlayerClientEventsMap>;


export class Game extends NanoEvents<EmitEventsMap> {
	private players = writable<Player[]>([]);
	private _players_info = writable<PlayerInfo[]>([]);

	private state: RecordStore<{
		holding: Holding;
		status: GameStatus;
		player: RoundStatePlayerStore;
		last: POINT | null;
	}, GameState>;

	constructor() {
		super();

		this._create_state_store();
		this._subscribe_players_data();

		onceStore({
			store: this.players,
			is: list => list.length === MAX_PLAYERS,
			run: () => this.start(),
		});
	}

	addPlayer(): Player | null {
		let player: Player | null = null;

		this.players.update(list => {
			if (list.length < MAX_PLAYERS) {
				player = new Player(list.length);
				return [...list, player];
			} else {
				return list;
			}
		});

		return player;
	}

	_create_state_store() {
		const player: RoundStatePlayerStore = record({
			first: null,
			current: null,
			win: null,
		});

		this.state = record({
			status: GameStatus.Waiting as GameStatus,
			player,
			holding: create_holding(),
			last: null,
		}, ({ status, player, holding, last }): GameState => {


			const { first, current } = player;

			if (status === GameStatus.Playing) {
				return {
					status,
					player: {
						first: first!,
						current: current!,
					},
					holding,
					last,
				};
			}

			if (status === GameStatus.End) {
				return {
					status,
					player: {
						first: first!,
						win: player.win,
					},
					holding,
					last,
				};
			}

			return { status: GameStatus.Waiting };
		});

		this.state.subscribe(state => {
			this.emit('broadcast.state', state);
		});
	}

	_subscribe_players_data() {
		let dispose_info;
		this.players.subscribe(list => {

			dispose_info?.();
			dispose_info = derived(list.map(d => d.info), d => [...d])
				.subscribe(this._players_info.set);
		});

		this._players_info.subscribe(players_info => {
			this.emit('broadcast.players', players_info);
		});
	}

	start() {
		let players = get(this.players);
		if (players.length < MAX_PLAYERS) return false;

		this.newRound();

		return true;
	}

	end(winner?: PLAYER_INDEX) {
		this.state.status.set(GameStatus.End);
		this.state.player.current.set(null);
		this.state.player.win.set(winner ?? null);

		this.newRound();
	}

	listenPlayerClientEvents(player: Player, client: GameClient) {
		client
			.on('fetch_player', () => {
				return get(this._players_info);
			})
			.on('fetch_state', () => {
				return get(this.state);
			})
			.on('ready', () => {
				player.ready.set(true);
			})
			.on('move', (position) => {
				if (this._isWaitingPlayerMove(player) && this._isMoveValid(position)) {
					this.emit('client.move', player, position);
					return true;
				}

				return false;
			});

		client.emit('index', player.index);
		client.emit('players', get(this._players_info));
		client.emit('state', get(this.state));
	}

	newRound() {
		let players = get(this.players);

		for (const player of players) {
			player.ready.set(false);
		}

		onceStore({
			store: derived(players.map(d => d.ready), list => !list.some(ready => !ready)),
			run: () => this._initNewRound(),
		});

	}

	_initNewRound() {
		this.state.player.first.set(0);
		// this.state.player.first.update(i => i === null ? 0 : get_next_player_index(i));

		this.state.holding.set(create_holding());

		this.state.status.set(GameStatus.Playing);

		this.state.player.current.set(null);

		this._roundLoop();
	}

	async _roundLoop() {
		const { player, point } = await this._waitForPlayerMove();

		player.move(this.state.holding, point);
		const holding = get(this.state.holding);

		if (is_win(holding, point)) {
			this.end(player.index);
			return;
		}
		if (is_full(holding)) {
			this.end();
			return;
		}

		this._roundLoop();
	}

	async _waitForPlayerMove() {
		const index = get(this.state.player);
		const next_index = get_next_player_index(index.current ?? (index.first ?? 0 - 1));

		return new Promise<{ player: Player, point: POINT }>(resolve => {
			this.once('client.move', (player: Player, point: POINT) => {
				resolve({ player, point });
			});

			this.state.player.current.set(next_index);
		});
	}

	_isWaitingPlayerMove(player: Player): boolean {
		return player.index === get(this.state.player.current);
	}

	_isMoveValid(point: POINT): boolean {
		const holding = get(this.state.holding);
		return is_position_empty(holding, point);
	}
}
