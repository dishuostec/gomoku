import {
	MAX_PLAYERS,
} from '@gomoku/common/src/room';
import { Game } from './game';
import type { Player } from './player';

export class Room {
	players: Map<string, Player> = new Map();
	clients: Map<Player, GameClient> = new Map();

	game = new Game;

	constructor() {
		this.game.on('broadcast.players', data => {
			this.clients.forEach(c => c.emit('players', data));
		});
		this.game.on('broadcast.state', data => {
			this.clients.forEach(c => c.emit('state', data));
		});
	}

	joined(id: string): boolean {
		return this.players.has(id);
	}

	canJoin(): boolean {
		return this.players.size < MAX_PLAYERS;
	}

	playerJoin(client: GameClient): boolean {
		const id = client.request.session?.id;

		if (this.joined(id)) {
			const player = this.players.get(id)!;
			this.clients.get(player)?.disconnect(true);
			this.initPlayer(player, client);
			return true;
		}

		if (!this.canJoin()) return false;

		const player = this.game.addPlayer();
		if (player) {
			this.players.set(id, player);
			this.initPlayer(player, client);
		}

		return true;
	}

	private initPlayer(player: Player, client: GameClient) {
		this.clients.set(player, client);

		player.online.set(true);

		client
			.on('disconnect', () => {
				player.online.set(false);
			});

		this.game.listenPlayerClientEvents(player, client);
	}


}
