export {}; // necessário pra evitar conflito de escopo

declare global {
	interface PlayerMp {
		giveMoney?: (amount: number) => void;
	}
}
