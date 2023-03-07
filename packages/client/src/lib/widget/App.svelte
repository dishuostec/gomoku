<script lang="ts">
	import ChessBoard from './ChessBoard.svelte';
	import { connection_state } from '../client';
	import PlayerBoard from './PlayerBoard.svelte';

</script>

<main>
	{#if !$connection_state}
		<p>Connecting...</p>
	{:else}
		<PlayerBoard />
		<ChessBoard />
	{/if}
</main>
