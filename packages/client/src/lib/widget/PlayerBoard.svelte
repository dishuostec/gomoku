<script lang="ts">
	import { GameStatus } from '@gomoku/common/src/game.js';
	import { game } from '../client';

	const { index, player, state } = game;

	let status;
	$: status = $state?.status;

	function ready_handler() {
		game.ready();
	}
</script>

<aside>
	{#each $player ?? [] as p, i}
		<div
			class:p1={i===0}
			class:p2={i===1}
		>
			<h1>
				{p.name}
				{#if i === $index}
					<em>(It's you.)</em>
				{/if}
			</h1>

			{#if status === GameStatus.End && $state.player.win === i}
				<strong>win</strong>
			{/if}

			{#if status === GameStatus.Waiting || status === GameStatus.End}
				{#if !p.ready}
					{#if $index === i}
						<button
							on:click={ready_handler}
						>I'm ready.
						</button>
					{:else}
						<span>Not ready.</span>
					{/if}
				{/if}
			{/if}

			{#if !p.online}
				<del>(offline)</del>
			{/if}
		</div>
	{/each}
</aside>

<style>
	h1::before {
		content: '';
		display: inline-block;
		width: 0.5em;
		height: 0.5em;
		border-radius: 100%;
		margin-right: 0.3em;
	}

	em {
		font-size: 0.7em;
		font-weight: normal;
	}

	.p1 h1::before {
		background-color: var(--player_1);
	}

	.p2 h1::before {
		background-color: var(--player_2);
	}

	aside {
		min-width: 20em;
		display: flex;
		justify-content: space-between;
		height: 10em;
	}

	strong {
		display: block;
		color: red;
	}

	del {
		display: block;
		text-decoration: none;
		font-weight: normal;
		font-size: 0.7em;
		color: red;
	}
</style>
