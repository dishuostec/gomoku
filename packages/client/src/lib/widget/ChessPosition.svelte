<script lang="ts">
	import {
		type POINT_VALUE,
	} from '@gomoku/common/src/game';
	import type { PLAYER_INDEX } from '@gomoku/common/src/room';
	import { createEventDispatcher } from 'svelte';

	export let my_turn: boolean;
	export let first: PLAYER_INDEX;
	export let current: PLAYER_INDEX;
	export let index: PLAYER_INDEX;
	export let value: POINT_VALUE;

	const dispatch = createEventDispatcher();

	function move() {
		if (value !== null) return;

		dispatch('move');
	}

	let used:boolean;
	$: used = value!==null;

</script>

<div
	class="position"
	class:disabled={!my_turn || used}
	class:p1={used && value===first}
	class:p2={used && value!==first}
	on:click={move}
>
	<i
		class:empty={value===null}
	/>
</div>

<style>
	.position {
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}

	.position:hover {
		background-color: rgba(97, 203, 55, 0.3);
	}

	.disabled {
		pointer-events: none;
	}


	i {
		display: block;
		width: 80%;
		height: 80%;
		border-radius: 100%;
		border: 1px solid #cccccc;
	}

	.empty {
		display: none;
	}

	.p1 i {
		background-color: var(--player_1);
	}

	.p2 i {
		background-color: var(--player_2);
	}
</style>

