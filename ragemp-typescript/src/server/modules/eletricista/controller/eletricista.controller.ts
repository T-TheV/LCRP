import { pontosDeReparo, pontoInicialEletricista } from '../data/pontos';

class EletricistaController {
	private progresso = new Map<number, number>();
	private repairing = new Set<number>();
	private aguardandoEntrega = new Set<number>();
	private textosDeReparo = new Map<number, TextLabelMp[]>();
	private choqueTimers = new Map<number, NodeJS.Timeout>();
	private reparoTimers = new Map<number, NodeJS.Timeout>();
	private choqueContador = new Map<number, number>(); // Contador de choques por jogador
	private vans = new Map<number, VehicleMp>(); // Guarda a van criada para cada jogador

	iniciarTrabalho(player: PlayerMp) {
		if (this.progresso.has(player.id)) {
			return player.outputChatBox('Você já iniciou o trabalho.');
		}
		if (player.vehicle) {
			return player.outputChatBox('Saia do veículo antes de iniciar o trabalho.');
		}
		if (player.position.subtract(pontoInicialEletricista).length() > 10) {
			return player.outputChatBox('Vá até o ponto de início para usar este comando.');
		}

		const van = mp.vehicles.new(mp.joaat('burrito'), player.position, {
			numberPlate: 'ELETRICISTA',
			color: [[255, 255, 255], [255, 255, 255]],
		});
		player.putIntoVehicle(van, 0);

		this.vans.set(player.id, van);
		this.progresso.set(player.id, 0);

		player.outputChatBox('Trabalho iniciado! Use /reparoeletrico nos pontos.');

		player.call('atualizarReparoHUD', [1, pontosDeReparo.length]);
		player.call('setReparoBlip', [
			pontosDeReparo[0].x,
			pontosDeReparo[0].y,
			pontosDeReparo[0].z,
		]);

		// Criar labels para todos os pontos
		const labels = pontosDeReparo.map((p, i) =>
			mp.labels.new(
				`~b~Ponto de Curto Elétrico ${i + 1}\n~w~[${i + 1}/${pontosDeReparo.length}]\n~y~Eletricista~n~~w~/reparoeletrico para consertar`,
				p,
				{
					font: 0,
					drawDistance: 20,
					los: true,
				},
			),
		);
		this.textosDeReparo.set(player.id, labels);

		// Enviar zonas para cliente
		const pontosComId = pontosDeReparo.map((p, i) => ({
			id: i,
			x: p.x,
			y: p.y,
			z: p.z,
			r: 30,
		}));
		player.call('elec:setSparkZones', [pontosComId]);

		console.log(`[Server] ${player.name} recebeu ${pontosComId.length} pontos de reparo.`);
	}

	startElectricalRepair(player: PlayerMp) {
		const idx = this.progresso.get(player.id) ?? 0;

		if (this.repairing.has(player.id)) {
			return player.outputChatBox('Você já está em um reparo.');
		}
		if (this.aguardandoEntrega.has(player.id)) {
			return player.outputChatBox('Reparos já concluídos.');
		}
		if (idx >= pontosDeReparo.length) {
			return player.outputChatBox('Sem pontos para reparar.');
		}

		const ponto = pontosDeReparo[idx];
		if (player.position.subtract(ponto).length() > 5) {
			return player.outputChatBox('Você saiu do ponto de reparo antes de concluir e deve voltar para continuar.');
		}

		this.repairing.add(player.id);
		this.choqueContador.set(player.id, 0);

		player.call('freezePlayer', [true]);
		player.outputChatBox(`Reparo ${idx + 1}/${pontosDeReparo.length} iniciado...`);
		player.playAnimation('mini@repair', 'fixing_a_ped', 8.0, 49);

		const choqueInterval = setInterval(() => {
			if (!player || !this.repairing.has(player.id)) {
				clearInterval(choqueInterval);
				return;
			}

			if (player.getVariable('luva') === true) {
				player.outputChatBox('Luva anti-choque ativada! Sem dano recebido.');
				return;
			}

			let choquesAtuais = this.choqueContador.get(player.id) ?? 0;
			if (choquesAtuais >= 5) {
				player.call('elec:showElectricEffect');
				return;
			}

			if (player.health <= 10) {
				clearInterval(choqueInterval);
				this.choqueTimers.delete(player.id);
				this.repairing.delete(player.id);
				this.choqueContador.delete(player.id);

				player.call('freezePlayer', [false]);
				player.stopAnimation();
				player.call('elec:stopShockEffect');
				player.call('elec:stopSparkSound', [idx + 1]);
				return player.outputChatBox('~r~Você está muito ferido para continuar o reparo! Trabalho cancelado.');
			}

			const dano = Math.min(Math.floor(Math.random() * (15 - 5 + 1)) + 5, player.health - 10);
			player.health -= dano;

			choquesAtuais++;
			this.choqueContador.set(player.id, choquesAtuais);

			player.call('freezePlayer', [true]);
			setTimeout(() => player.call('freezePlayer', [false]), 500);

			player.call('elec:playShockSound');
			player.call('elec:showElectricEffect');

			player.outputChatBox(`~r~Você levou um choque de ${dano} de dano! (${choquesAtuais}/5)`);
			player.call('elec:notifyShock', [`~r~Você levou um choque de ~w~${dano}~r~ de dano!`]);
		}, 2000);

		this.choqueTimers.set(player.id, choqueInterval);

		const reparoTimeout = setTimeout(() => {
			clearInterval(choqueInterval);
			this.choqueTimers.delete(player.id);
			this.choqueContador.delete(player.id);

			player.call('freezePlayer', [false]);
			player.stopAnimation();
			this.repairing.delete(player.id);

			player.call('elec:stopShockEffect');
			player.call('elec:stopSparkSound', [idx + 1]);

			const next = idx + 1;
			this.progresso.set(player.id, next);

			if (next < pontosDeReparo.length) {
				player.call('atualizarReparoHUD', [next + 1, pontosDeReparo.length]);
				const proximoPonto = pontosDeReparo[next];
				player.call('setReparoBlip', [proximoPonto.x, proximoPonto.y, proximoPonto.z]);
				player.outputChatBox(`Reparo concluído! Vá ao ponto ${next + 1}.`);
			} else {
				player.outputChatBox('Todos os reparos concluídos! Use /finalizartrabalho.');
				player.call('clearReparoBlip');
				player.call('setBlipDeEntrega', [
					pontoInicialEletricista.x,
					pontoInicialEletricista.y,
					pontoInicialEletricista.z,
				]);
				this.aguardandoEntrega.add(player.id);
			}

			this.reparoTimers.delete(player.id);
		}, 10000);

		this.reparoTimers.set(player.id, reparoTimeout);
	}

	cancelarTrabalho(player: PlayerMp) {
		if (!this.progresso.has(player.id)) {
			return player.outputChatBox('Você não iniciou o trabalho.');
		}
		if (this.repairing.has(player.id)) {
			return player.outputChatBox('Você está em um reparo ativo. Use /reparoeletrico para concluir ou aguarde.');
		}

		// Destrói a van vinculada ao jogador, se existir
		const van = this.vans.get(player.id);
		if (van && mp.vehicles.exists(van)) {
			van.destroy();
			this.vans.delete(player.id);
		}

		// Cancela progresso e limpa labels
		this.progresso.delete(player.id);
		this.repairing.delete(player.id);
		this.aguardandoEntrega.delete(player.id);

		player.call('clearReparoBlip');
		player.call('elec:stopShockEffect');
		player.call('elec:stopSparkSound');

		const labels = this.textosDeReparo.get(player.id);
		if (labels) {
			labels.forEach(label => label.destroy());
			this.textosDeReparo.delete(player.id);
		}

		player.outputChatBox('Trabalho cancelado e van removida. Você pode iniciar novamente com /iniciartrabalho.');
	}

	finalizarEntrega(player: PlayerMp) {
		if (!this.aguardandoEntrega.has(player.id)) {
			return player.outputChatBox('Sem van para entregar.');
		}
		if (player.position.subtract(pontoInicialEletricista).length() > 10) {
			return player.outputChatBox('Vá até o ponto de entrega.');
		}
		if (!player.vehicle || player.seat !== 0) {
			return player.outputChatBox('Você precisa estar dirigindo a van.');
		}

		player.call('freezePlayer', [true]);
		player.playAnimation('gestures@m@standing@casual', 'gesture_hand_down', 8.0, 49);
		player.outputChatBox('Entregando van...');
		setTimeout(() => {
			player.call('freezePlayer', [false]);
			player.stopAnimation();
			player.outputChatBox('Serviço concluído! $250 pago.');
			player.giveMoney?.(250);
			player.vehicle.destroy();
			player.call('clearReparoBlip');
			this.aguardandoEntrega.delete(player.id);

			const labels = this.textosDeReparo.get(player.id);
			labels?.forEach(l => l.destroy());
			this.textosDeReparo.delete(player.id);

			// ✅ Finaliza som visual e lógica do client também
			player.call('elec:stopSparkSound'); // Chama o evento sem argumentos para parar todos os sons		
		}, 5000);
	}
}

export default new EletricistaController();
