export type NumberRange<
	L extends number,
	H extends number,
	BetWeen extends boolean = false,
	I extends unknown[] = [],
	UnionNumber extends number = never,
	IL extends number = I['length']> = IL extends H
	? UnionNumber | H
	: IL extends L
		? NumberRange<L, H, true, [...I, 0], UnionNumber | L>
		: BetWeen extends true
			? NumberRange<L,H, true, [...I,0], UnionNumber | IL >
			: NumberRange<L,H, BetWeen, [...I, 0], UnionNumber>

export type PrependParam<T extends any, Fn extends (...args: any) => any> = (...args: [T, ...Parameters<Fn>]) => ReturnType<Fn>;
export type PrependParams<T extends any[], Fn extends (...args: any) => any> = (...args: [...T, ...Parameters<Fn>]) => ReturnType<Fn>;

export type AppendParam<T extends any, Fn extends (...args: any) => any> = (...args: [...Parameters<Fn>, T]) => ReturnType<Fn>;
export type AppendParams<T extends any[], Fn extends (...args: any) => any> = (...args: [...Parameters<Fn>, ...T]) => ReturnType<Fn>;


export type CombineString<T extends string, Prepend extends string = '', Append extends string = ''> = `${Prepend}${T}${Append}`;
