<script lang="ts">
	import {
		GameStatus,
		type Holding,
	} from '@gomoku/common/src/game.js';
	import ChessPosition from './ChessPosition.svelte';
	import { game } from '../client';

	const { index, state } = game;

	let holding: Holding | null;
	$: holding = $state?.status !== GameStatus.Waiting ? $state?.holding : null;

	function move_handler(row, col) {
		game.move({ row, col });
	}
</script>

<section>
	<div id="chessboard">
		{#each holding ?? [] as row,i}
			<div class={`row row_${i}`}>
				{#each row as value, j}
					<div class={`col col_${j}`}>
						<div class="cell">
							{#if holding}
								<ChessPosition
									first={$state?.player?.first}
									current={$state?.player?.current}
									index={$index}
									my_turn={$state?.player.current === $index}
									value={value}
									on:move={()=>move_handler(i,j)}
								/>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>

	{#if $state?.status === GameStatus.Playing}
		{#if $state?.player.current === $index}
			<p>It's your turn now.</p>
		{:else}
			<p>Please wait for the opponent to play.</p>
		{/if}
	{/if}
</section>

<style lang="scss">
	#chessboard {
		display: flex;
		flex-direction: column;
		margin: 0 auto;
		width: 20em;
		height: 20em;
		position: relative;
	}

	#chessboard::before {
		display: block;
		content: '';
		background-color: #aaaaaa;
		width: 7px;
		height: 7px;
		top: 50%;
		left: 50%;
		margin-left: -3px;
		margin-top: -3px;
		position: absolute;
		border-radius: 100%;
	}

	.row {
		display: flex;
		height: 33.3%;
	}

	.col {
		width: 33.3%;
	}

	.cell {
		position: relative;
		height: 100%;
		width: 100%;

		&::before, &::after {
			display: block;
			content: '';
			background-color: #cccccc;
			width: 1px;
			height: 1px;
			top: 0;
			left: 0;
			position: absolute;
			z-index: -1;
		}


		&::before {
			width: 100%;
			top: 50%;

			.col_0 & {
				width: 50%;
				left: 50%;
			}

			.col_14 & {
				width: 50%;
			}
		}

		&::after {
			height: 100%;
			left: 50%;

			.row_0 & {
				height: 50%;
				top: 50%;
			}

			.row_14 & {
				height: 50%;
			}
		}
	}


</style>
