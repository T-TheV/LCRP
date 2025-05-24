import { SHARED_CONSTANTS } from '@shared/constants';
import './sfx'; // Registra os eventos de som
import './hud'; // Registra a HUD assim que este módulo é importado



let currentBlip: BlipMp | null = null;

/* --------------------------------- READY --------------------------------- */
mp.events.add('playerReady', () => {
	const player = mp.players.local;

	mp.console.logInfo(`${player.name} is ready!`);
	mp.console.logInfo(SHARED_CONSTANTS.HELLO_WORLD);

	player.customProperty = 1;
	mp.console.logInfo(`customProperty: ${player.customProperty}`);

	player.customMethod = () => mp.console.logInfo('customMethod called.');
	player.customMethod();
});

/* ------------------------- UTILIDADES GERAIS ----------------------------- */
mp.events.add('freezePlayer', (shouldFreeze: boolean) => {
	mp.players.local.freezePosition(shouldFreeze);
});

mp.events.add('teleportSafe', (x: number, y: number, z: number) => {
	setTimeout(() => {
		mp.players.local.position = new mp.Vector3(x, y, z);
	}, 250);
});

/* ---------------------------- BLIPS & ROTAS ------------------------------ */
function clearCurrentBlip() {
	if (currentBlip) {
		currentBlip.destroy();
		currentBlip = null;
	}
}

// Rota amarela até o ponto de reparo
mp.events.add('setReparoBlip', (x: number, y: number, z: number) => {
	clearCurrentBlip();

	currentBlip = mp.blips.new(1, new mp.Vector3(x, y, z), {
		name: 'Ponto de Reparo',
		scale: 1.0,
		color: 5,
		shortRange: false
	});

	currentBlip.setRoute(true);
	currentBlip.setRouteColour(5);
});

// Blip fixo do emprego
mp.events.add('createBlipInicialEletricista', (x: number, y: number, z: number) => {
	mp.blips.new(354, new mp.Vector3(x, y, z), {
		name: '📍 Emprego: Eletricista',
		scale: 1.0,
		color: 3,
		shortRange: true
	});
});

// Rota para devolver a van
mp.events.add('setBlipDeEntrega', (x: number, y: number, z: number) => {
	clearCurrentBlip();

	currentBlip = mp.blips.new(354, new mp.Vector3(x, y, z), {
		name: 'Devolver Van',
		scale: 1.0,
		color: 5,
		shortRange: false
	});

	currentBlip.setRoute(true);
	currentBlip.setRouteColour(5);
});

// Limpa qualquer blip ativo
mp.events.add('clearReparoBlip', clearCurrentBlip);


// Sons
