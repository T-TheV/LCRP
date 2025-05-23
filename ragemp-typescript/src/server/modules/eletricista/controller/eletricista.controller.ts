import { pontosDeReparo, pontoInicialEletricista } from '../data/pontos';

class EletricistaController {
	private progresso: Map<number, number> = new Map();
	private repairing: Set<number> = new Set();
	private aguardandoEntrega: Set<number> = new Set();
	private textosDeReparo: Map<number, TextLabelMp[]> = new Map();

	iniciarTrabalho(player: PlayerMp) {
		if (this.progresso.has(player.id)) {
			player.outputChatBox('❗ Você já iniciou o trabalho. Vá até os pontos de reparo elétrico.'); // ou use /tpe.');
			return;
		}

		if (player.vehicle) {
			player.outputChatBox('🚫 Saia do veículo atual antes de iniciar o trabalho.');
			return;
		}

		const distancia = player.position.subtract(pontoInicialEletricista).length();
		if (distancia > 10) {
			player.outputChatBox('⚠️ Vá até o ponto de início de trabalho para usar este comando.');
			return;
		}

		const van = mp.vehicles.new(mp.joaat('burrito'), player.position, {
			numberPlate: 'ELETRICISTA',
			color: [[255, 255, 255], [255, 255, 255]],
		});

		player.putIntoVehicle(van, 0);
		this.progresso.set(player.id, 0);
		player.outputChatBox('🔧 Trabalho iniciado! Vá até o ponto 1 e digite /reparoeletrico.');

		const primeiroPonto = pontosDeReparo[0];
		player.call('atualizarReparoHUD', [1, pontosDeReparo.length]);
		player.call('setReparoBlip', [primeiroPonto.x, primeiroPonto.y, primeiroPonto.z]);

		// Cria textos 3D para todos os pontos de reparo
		const labels: TextLabelMp[] = [];

		pontosDeReparo.forEach((ponto, index) => {
			const texto = mp.labels.new(
				`~b~Ponto de Reparo\n~w~[${index + 1}/${pontosDeReparo.length}]`,
				ponto,
				{
					font: 0,
					drawDistance: 20,
					los: true
				}
			);
			labels.push(texto);
		});

		this.textosDeReparo.set(player.id, labels);
	}

	startElectricalRepair(player: PlayerMp): void {
		const progressoAtual = this.progresso.get(player.id) ?? 0;

		if (this.repairing.has(player.id)) {
			player.outputChatBox('⛔ Você já está em um reparo.');
			return;
		}

		if (this.aguardandoEntrega.has(player.id)) {
			player.outputChatBox('📦 Você já concluiu os reparos. Vá devolver a van.');
			return;
		}

		if (progressoAtual >= pontosDeReparo.length) {
			player.outputChatBox('✅ Você já completou todos os reparos.');
			return;
		}

		const ponto = pontosDeReparo[progressoAtual];
		const distancia = player.position.subtract(ponto).length();

		if (distancia > 5) {
			player.outputChatBox('📍 Você não está no local correto para o reparo.');
			return;
		}

		this.repairing.add(player.id);
		player.call('freezePlayer', [true]);
		player.outputChatBox(`🔌 Iniciando reparo ${progressoAtual + 1}/${pontosDeReparo.length}...`);
		player.playAnimation('mini@repair', 'fixing_a_ped', 8.0, 49);

		setTimeout(() => {
			player.call('freezePlayer', [false]);
			player.stopAnimation();
			this.repairing.delete(player.id);

			const novoProgresso = progressoAtual + 1;
			this.progresso.set(player.id, novoProgresso);

			if (novoProgresso >= pontosDeReparo.length) {
				player.outputChatBox('✅ Todos os reparos foram feitos! Entregue a van no ponto de entrega com /finalizartrabalho.');
				player.call('clearReparoBlip');
				player.call('setBlipDeEntrega', [
					pontoInicialEletricista.x,
					pontoInicialEletricista.y,
					pontoInicialEletricista.z
				]);
				this.aguardandoEntrega.add(player.id);
			} else {
				player.outputChatBox(`✅ Reparo concluído! Vá ao ponto ${novoProgresso + 1}/${pontosDeReparo.length}.`);
				const proximoPonto = pontosDeReparo[novoProgresso];
				player.call('setReparoBlip', [proximoPonto.x, proximoPonto.y, proximoPonto.z]);
				player.call('atualizarReparoHUD', [novoProgresso + 1, pontosDeReparo.length]);
			}
		}, 10000);
	}

	finalizarEntrega(player: PlayerMp) {
		if (!this.aguardandoEntrega.has(player.id)) {
			player.outputChatBox('❌ Você não está com uma van para entregar.');
			return;
		}

		const distancia = player.position.subtract(pontoInicialEletricista).length();
		if (distancia > 10) {
			player.outputChatBox('📍 Vá até o ponto de entrega para finalizar o serviço.');
			return;
		}

		if (!player.vehicle || player.seat !== 0) {
			player.outputChatBox('🚐 Você precisa estar dirigindo a van para entregá-la.');
			return;
		}

		player.call('freezePlayer', [true]);
		player.playAnimation('gestures@m@standing@casual', 'gesture_hand_down', 8.0, 49);
		player.outputChatBox('📦 Entregando van e assinando a ordem de serviço efetuada...');

		setTimeout(() => {
			player.call('freezePlayer', [false]);
			player.stopAnimation();
			player.outputChatBox('✅ Van entregue com sucesso. Você recebeu $250 pelo serviço!');
			player.giveMoney?.(250);

			player.vehicle.destroy();
			player.call('clearReparoBlip');
			this.aguardandoEntrega.delete(player.id);

			// Remove textos 3D
			const textos = this.textosDeReparo.get(player.id);
			if (textos) {
				textos.forEach(t => t.destroy());
				this.textosDeReparo.delete(player.id);
			}
		}, 5000);
	}
}

export default new EletricistaController();
