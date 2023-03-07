interface EventsMap {
	[event: string]: any;
}

interface DefaultEventsMap {
	[event: string]: (...args: any[]) => void;
}

type EventNames<Map extends EventsMap> =
	keyof Map
	& (string | symbol);
type EventParams<Map extends EventsMap, Ev extends EventNames<Map>> = Parameters<Map[Ev]>;

type AllEventHandlers<EmitEvents extends EventsMap> = {
	[Ev in EventNames<EmitEvents>]: ((...args: EventParams<EmitEvents, Ev>) => void)[]
}

export class NanoEvents<EmitEvents extends EventsMap = DefaultEventsMap> {
	#events: AllEventHandlers<EmitEvents> = {} as any;

	emit<Ev extends EventNames<EmitEvents>>(ev: Ev, ...args: EventParams<EmitEvents, Ev>): void {
		ev = ev.toString() as Ev;

		this.#events[ev]?.map((handler) => {
			handler(...args);
		});
	};

	on<Ev extends EventNames<EmitEvents>>(ev: Ev, listener: EmitEvents[Ev]): () => void {
		ev = ev.toString() as Ev;

		(this.#events[ev] = this.#events[ev] || []).push(listener);
		return () => this.off(ev, listener);
	};

	off<Ev extends EventNames<EmitEvents>>(ev: Ev, listener: EmitEvents[Ev]): void {
		const list = this.#events[ev]?.filter(item => item !== listener);
		if (list?.length) {
			this.#events[ev] = list;
		} else {
			delete this.#events[ev];
		}
	}

	once<Ev extends EventNames<EmitEvents>>(ev: Ev, listener: EmitEvents[Ev]): () => void {
		const unsub = this.on(ev, ((...args) => {
			listener(...args);
			unsub();
		}) as EmitEvents[Ev]);

		return unsub;
	};

}
