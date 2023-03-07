import type { Readable } from 'svelte/store';

export function onceStore<T>({
	store,
	is = d => !!d,
	run,
}: {
	store: Readable<T>,
	is?: (data: T) => boolean,
	run: (data: T) => void,
}): () => void {
	const dispose = store.subscribe(data => {
		if (is(data)) {
			dispose();
			run(data);
		}
	});

	return dispose;
}
