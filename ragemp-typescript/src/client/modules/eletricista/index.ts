import { SHARED_CONSTANTS } from '@shared/constants';
import './sfx'; // Registra os eventos de som
import './hud'; // Registra a HUD assim que este módulo é importado

let currentBlip: BlipMp | null = null;
let electricEffectHandle: number | null = null;

let podeLevarChoque = true;

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

/* ---------------------------- SONS & EFEITOS ----------------------------- */
mp.events.add('elec:playShockSound', () => {
	mp.game.audio.playSoundFrontend(-1, "Electric_Shot", "DLC_HEISTS_GENERAL_FRONTEND_SOUNDS", true);
});

mp.events.add('elec:showElectricEffect', () => {
	if (electricEffectHandle === null) {
		const playerPed = mp.players.local.handle;
		electricEffectHandle = mp.game.graphics.startParticleFxLoopedOnEntity(
			"ent_amb_electricity_loop",
			playerPed,
			0, 0, 0,
			0, 0, 0,
			1,
			false, false, false
		);
	}
});

mp.events.add('elec:stopShockEffect', () => {
	if (electricEffectHandle !== null) {
		mp.game.graphics.stopParticleFxLooped(electricEffectHandle, false);
		electricEffectHandle = null;
	}
	mp.game.audio.stopSound(-1);
});

/* ---------------------------- CHOQUE ELÉTRICO ----------------------------- */
function tentarChoque() {
    if (!podeLevarChoque) return;

    podeLevarChoque = false;
    const player = mp.players.local;

    // Decide se vai levar choque e o dano
    const rand = Math.random();

    let dano = 0;
    if (rand < 0.90) { // 90% chance de levar choque
        // Dano entre 5 e 15
        dano = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
        player.health = Math.max(player.health - dano, 0);

        // Mostrar notificações
        mp.game.graphics.notify(`~r~Você levou um choque de ~w~${dano}~r~ de dano!`);
        mp.gui.chat.push(`Você levou um choque de ${dano} de dano!`);

        // Efeitos visuais e sonoros
        mp.game.graphics.startScreenEffect("DeathFailNeutralIn", 0.5, true);
        mp.game.cam.shakeGameplayCam("SMALL_EXPLOSION_SHAKE", 0.2);
        mp.events.call('elec:showElectricEffect');
        mp.events.call('elec:playShockSound');

        // Para efeito e som após 1.5s
        setTimeout(() => {
            mp.events.call('elec:stopShockEffect');
        }, 1500);
    } else {
        // Sem choque
        mp.gui.chat.push(`Você não levou choque desta vez.`);
    }

    // Libera pra tentar choque novamente após 3 segundos
    setTimeout(() => {
        podeLevarChoque = true;
    }, 3000);
}



// Exemplo: adiciona evento para usar a função
mp.events.add('elec:tentarChoque', () => {
	tentarChoque();
});

/* -------------------------- NOTIFICAÇÃO DE CHOQUE -------------------------- */
mp.events.add('elec:notifyShock', (mensagem: string) => {
	mp.game.graphics.notify(mensagem);
});
