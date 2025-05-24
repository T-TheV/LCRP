import { pontosDeReparo, pontoInicialEletricista } from '../data/pontos';

class EletricistaController {
	private progresso = new Map<number, number>();
	private repairing = new Set<number>();
	private aguardandoEntrega = new Set<number>();
	private textosDeReparo = new Map<number, TextLabelMp[]>();

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
			color: [[255, 255, 255], [255, 255, 255]]
		});
		player.putIntoVehicle(van, 0);

		this.progresso.set(player.id, 0);
		player.outputChatBox('Trabalho iniciado! Use /reparoeletrico nos pontos.');

		player.call('atualizarReparoHUD', [1, pontosDeReparo.length]);
		player.call('setReparoBlip', [
			pontosDeReparo[0].x,
			pontosDeReparo[0].y,
			pontosDeReparo[0].z
		]);

		const labels = pontosDeReparo.map((p, i) =>
			mp.labels.new(`~b~Ponto de Curto Elétrico ${i + 1}\n~w~[${i + 1}/${pontosDeReparo.length}]\n~y~Eletricista~n~~w~/reparoeletrico para consertar`, p, {
				font: 0,
				drawDistance: 20,
				los: true
			})
		);
		this.textosDeReparo.set(player.id, labels);

		// ✅ Envia todos os pontos para o cliente com tag de índice
		const pontosComId = pontosDeReparo.map((p, i) => ({
			id: i,
			x: p.x,
			y: p.y,
			z: p.z,
			r: 30
		}));
		player.call('elec:setSparkZones', [pontosComId]);
		console.log(`[Server] ${player.name} recebeu ${pontosComId.length} pontos de som.`);
	}

	startElectricalRepair(player: PlayerMp) {
		const idx = this.progresso.get(player.id) ?? 0;
		if (this.repairing.has(player.id)) return player.outputChatBox('Você já está em um reparo.');
		if (this.aguardandoEntrega.has(player.id)) return player.outputChatBox('Reparos já concluídos.');
		if (idx >= pontosDeReparo.length) return player.outputChatBox('Sem pontos para reparar.');

		const ponto = pontosDeReparo[idx];
		if (player.position.subtract(ponto).length() > 5) {
			return player.outputChatBox('Não está no local correto.');
		}

		this.repairing.add(player.id);
		player.call('freezePlayer', [true]);
		player.outputChatBox(`Reparo ${idx + 1}/${pontosDeReparo.length}...`);
		player.playAnimation('mini@repair', 'fixing_a_ped', 8.0, 49);

		setTimeout(() => {
			player.call('freezePlayer', [false]);
			player.stopAnimation();
			this.repairing.delete(player.id);

			// ✅ para som do ponto específico
			player.call('elec:stopSparkSound', [idx + 1]); // Enviar idx + 1 para ser 1-based
			const next = idx + 1;
			this.progresso.set(player.id, next);

			if (next < pontosDeReparo.length) {
				player.call('atualizarReparoHUD', [next + 1, pontosDeReparo.length]);
				const p2 = pontosDeReparo[next];
				player.call('setReparoBlip', [p2.x, p2.y, p2.z]);
				player.outputChatBox(`Reparo concluído! Vá ao ponto ${next + 1}.`);
			} else {
				player.outputChatBox('Todos os reparos concluídos! Use /finalizartrabalho.');
				player.call('clearReparoBlip');
				player.call('setBlipDeEntrega', [
					pontoInicialEletricista.x,
					pontoInicialEletricista.y,
					pontoInicialEletricista.z
				]);
				this.aguardandoEntrega.add(player.id);
			}
		}, 10000);
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
