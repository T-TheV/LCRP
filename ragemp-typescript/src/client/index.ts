import { SHARED_CONSTANTS } from '@shared/constants';

let currentBlip: BlipMp | null = null;
let hudReparoTexto = '';
let mostrarHudReparo = false;

mp.events.add('playerReady', () => {
	mp.console.logInfo(`${mp.players.local.name} is ready!`);
	mp.console.logInfo(SHARED_CONSTANTS.HELLO_WORLD);

	mp.players.local.customProperty = 1;
	mp.console.logInfo(`customProperty: ${mp.players.local.customProperty}`);

	mp.players.local.customMethod = () => {
		mp.console.logInfo(`customMethod called.`);
	};

	mp.players.local.customMethod();
});

// Congela/descongela jogador
mp.events.add('freezePlayer', (shouldFreeze: boolean) => {
	mp.players.local.freezePosition(shouldFreeze);
});

// Teleporte com delay de segurança
mp.events.add('teleportSafe', (x: number, y: number, z: number) => {
	setTimeout(() => {
		mp.players.local.position = new mp.Vector3(x, y, z);
	}, 250);
});

// Mostra o ponto de reparo com blip e rota amarela
mp.events.add('setReparoBlip', (x: number, y: number, z: number) => {
	if (currentBlip) {
		currentBlip.destroy();
		currentBlip = null;
	}

	currentBlip = mp.blips.new(1, new mp.Vector3(x, y, z), {
		name: 'Ponto de Reparo',
		scale: 1.0,
		color: 5,
		shortRange: false
	});

	currentBlip.setRoute(true);
	currentBlip.setRouteColour(5);
});

// Blip fixo do local de emprego (sem rota)
mp.events.add('createBlipInicialEletricista', (x: number, y: number, z: number) => {
	mp.blips.new(354, new mp.Vector3(x, y, z), {
		name: '📍 Emprego: Eletricista',
		scale: 1.0,
		color: 3,
		shortRange: true
	});
});

// Blip e rota amarela para devolução da van
mp.events.add('setBlipDeEntrega', (x: number, y: number, z: number) => {
	if (currentBlip) {
		currentBlip.destroy();
		currentBlip = null;
	}

	currentBlip = mp.blips.new(354, new mp.Vector3(x, y, z), {
		name: 'Devolver Van',
		scale: 1.0,
		color: 5,
		shortRange: false
	});

	currentBlip.setRoute(true);
	currentBlip.setRouteColour(5);
});

// Remove o blip atual
mp.events.add('clearReparoBlip', () => {
	if (currentBlip) {
		currentBlip.destroy();
		currentBlip = null;
	}
});

// Atualiza HUD com progresso dos reparos
mp.events.add('atualizarReparoHUD', (atual: number, total: number) => {
	hudReparoTexto = `🔧 Reparos concluídos: ${atual - 1}/${total}`;
	mostrarHudReparo = true;

	setTimeout(() => {
		mostrarHudReparo = false;
	}, 8000);
});

// Renderiza a HUD
mp.events.add('render', () => {
	if (mostrarHudReparo && hudReparoTexto) {
		mp.game.graphics.drawText(
			hudReparoTexto,
			[0.5, 0.92],
			{
				font: 4,
				color: [255, 255, 255, 255],
				scale: [0.4, 0.4],
				outline: true,
				centre: true
			}
		);
	}
});
