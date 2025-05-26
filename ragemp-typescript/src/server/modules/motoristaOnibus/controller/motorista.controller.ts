import { rotasDeOnibus, pontoInicialMotorista } from '../data/motorista.data';
import { PassageiroNPC } from '../types/passageiro';

const npcModelos = [
    'a_m_m_business_01',
    'a_m_y_beach_01',
    'a_f_y_hipster_01',
    'a_m_y_skater_01',
    'a_f_y_tourist_01'
];

class MotoristaController {
    public passageirosNPCs = new Map<number, PassageiroNPC[]>();
    public onibusMap = new Map<number, VehicleMp>();
    public passageirosEmOnibus = new Map<number, Set<PassageiroNPC>>();
    public avaliacao = new Map<number, number>();
    public rotaMap = new Map<number, typeof rotasDeOnibus[0]>();
    public progresso = new Map<number, number>();
    public voltasRestantes = new Map<number, number>();
    public textosDeParada = new Map<number, TextLabelMp[]>();
    public blips = new Map<number, BlipMp[]>();



    atualizarHUD(player: PlayerMp) {
        const avaliacao = this.avaliacao.get(player.id) || 0;
        const embarcados = this.passageirosNPCs.get(player.id)?.filter(p => p.entrouNoOnibus).length || 0;
        const voltas = this.voltasRestantes.get(player.id) || 0;
        const rota = this.rotaMap.get(player.id)?.nome || 'Desconhecida';

        player.call('motorista:atualizarHUD', [{
            avaliacao,
            embarcados,
            voltas,
            rota
        }]);
    }

    criarBlipsParaRota(player: PlayerMp) {
        const rota = this.rotaMap.get(player.id);
        if (!rota) return;

        const blipsCriados: BlipMp[] = [];

        rota.pontos.forEach((ponto) => {
            let corBlip = 5, iconeBlip = 1, nome = 'Percurso';
            if (ponto.tipo === 'inicio') { nome = 'Início da Rota'; corBlip = 2; iconeBlip = 164; }
            else if (ponto.tipo === 'passageiro') { nome = 'Ponto de Passageiro'; corBlip = 3; iconeBlip = 280; }
            else if (ponto.tipo === 'fim') { nome = 'Fim da Rota'; corBlip = 1; iconeBlip = 38; }

            const blip = mp.blips.new(iconeBlip, ponto.pos, { name: nome, color: corBlip, shortRange: true });
            blipsCriados.push(blip);
        });

        this.blips.set(player.id, blipsCriados);
    }

    removerBlips(player: PlayerMp) {
        this.blips.get(player.id)?.forEach(blip => blip.destroy());
        this.blips.delete(player.id);
    }

    criarCheckpoint(player: PlayerMp) {
    const rota = this.rotaMap.get(player.id);
    const index = this.progresso.get(player.id) || 0;
    if (!rota) return;

    const ponto = rota.pontos[index];

    const checkpoint = mp.checkpoints.new(1, ponto.pos, 3, {
        direction: new mp.Vector3(0, 0, 0),
        color: [255, 200, 0, 100],
        visible: true,
        dimension: player.dimension
    });

    // 🔒 Salva o checkpoint ativo no player
    player.setVariable('motorista:checkpoint', checkpoint);

    const label = mp.labels.new(`~y~${ponto.tipo.toUpperCase()}`, ponto.pos, {
        drawDistance: 20,
        dimension: player.dimension
    });
    this.textosDeParada.set(player.id, [label]);

    player.call('motorista:waypoint', [ponto.pos.x, ponto.pos.y, ponto.tipo]);

    if (ponto.tipo === 'passageiro') {
        player.outputChatBox('Aguarde o passageiro subir...');

        const skinAleatoria = npcModelos[Math.floor(Math.random() * npcModelos.length)];
        const npcPosition = ponto.pos_passageiro || ponto.pos;

        const npc = mp.peds.new(mp.joaat(skinAleatoria), npcPosition, {
            heading: 0,
            dimension: player.dimension
        });

        const passageiro: PassageiroNPC = {
            ped: npc,
            destinoIndex: index + 1,
            entrouNoOnibus: false
        };

        const lista = this.passageirosNPCs.get(player.id) || [];
        this.passageirosNPCs.set(player.id, [...lista, passageiro]);

        const veh = this.onibusMap.get(player.id);
        if (veh) {
            veh.engine = false;
            veh.setVariable('motorista:congelado', true);
        }

        setTimeout(() => {
            if (!mp.players.exists(player) || !mp.peds.exists(npc)) return;
            const veh = this.onibusMap.get(player.id);
            if (!veh) return;

            let seat = 1;
            const usedSeats = new Set<number>();

            this.passageirosNPCs.get(player.id)?.forEach(p => {
                const s = (p as any).seat;
                if (p.entrouNoOnibus && s !== undefined) {
                    usedSeats.add(s);
                }
            });

            while (usedSeats.has(seat) && seat < 10) seat++;

            if (seat >= 10) {
                npc.destroy();
                player.outputChatBox('Ônibus lotado. Passageiro não pôde embarcar.');
                return;
            }

            (passageiro as any).seat = seat;
            player.call('motorista:npcEntrar', [npc.id, veh.id, seat]);
        }, 2000);
    }

    const passageiros = this.passageirosNPCs.get(player.id) || [];
    passageiros.forEach(p => {
        if (p.entrouNoOnibus && index >= p.destinoIndex) {
            this.passageirosEmOnibus.get(player.id)?.delete(p);
            player.call('motorista:npcSair', [p.ped.id, this.onibusMap.get(player.id)?.id || 0]);
            player.outputChatBox('Passageiro desembarcando no destino.');
        }
    });

    const handler = (entity: PlayerMp) => {
  if (entity.id !== player.id) return;
  if (player.vehicle !== this.onibusMap.get(player.id)) return;

  // 🔹 Destroi checkpoint e label
  checkpoint.destroy();
  label.destroy();
  mp.events.remove('playerEnterCheckpoint', handler);

  const pontoTipo = ponto.tipo;
  const indexAtual = this.progresso.get(player.id) || 0;

  // 🔹 Destroi blip do ponto atual, exceto o ponto INICIAL
  const blips = this.blips.get(player.id);
  const blipAtual = blips?.[indexAtual];

  if (pontoTipo !== 'inicio' && blipAtual && mp.blips.exists(blipAtual)) {
    blipAtual.destroy();
    blips![indexAtual] = null as any;
  }

  // 🧍 Espera embarque do passageiro ser confirmado via evento
  if (pontoTipo === 'passageiro') return;

  // 🔴 Se for o ponto FIM
  if (pontoTipo === 'fim') {
    const voltas = (this.voltasRestantes.get(player.id) || 1) - 1;

    if (voltas <= 0) {
      // ✅ Fim de todas as voltas — só guia até a base final
      player.call('motorista:waypoint', [
        pontoInicialMotorista.x,
        pontoInicialMotorista.y,
        'fim'
      ]);
      player.outputChatBox('Volte ao ponto inicial para finalizar o serviço com /finalizaronibus.');
      return;
    }

    // 🔁 Ainda tem voltas restantes, reinicia a rota
    this.voltasRestantes.set(player.id, voltas);
    this.progresso.set(player.id, 0);
    player.outputChatBox(`Nova volta iniciada. Voltas restantes: ${voltas}`);
    this.atualizarHUD(player);

    // ❗️ IMPORTANTE: apenas gera o próximo checkpoint (sem recriar todos os blips)
    setTimeout(() => {
      this.criarCheckpoint(player);
    }, 100);

    return;
  }

  // ⏩ Se for ponto normal (progresso/início), avança normalmente
  this.avancarParaProximoPonto(player);
};

    mp.events.add('playerEnterCheckpoint', handler);
}



    iniciarTrabalho(player: PlayerMp) {
        if (this.progresso.has(player.id)) {
            return player.outputChatBox('Você já iniciou o trabalho de motorista.');
        }
        if (player.vehicle) {
            return player.outputChatBox('Saia do veículo para iniciar o trabalho.');
        }
        if (player.position.subtract(pontoInicialMotorista).length() > 10) {
            return player.outputChatBox('Vá até o ponto de emprego para usar este comando.');
        }

        const rota = rotasDeOnibus[Math.floor(Math.random() * rotasDeOnibus.length)];
        const voltas = 1 //+ Math.floor(Math.random() * 3); ATIVAR DE VOLTA DEPOIS

        this.rotaMap.set(player.id, rota);
        this.progresso.set(player.id, 0);
        this.voltasRestantes.set(player.id, voltas);
        this.passageirosNPCs.set(player.id, []);
        this.passageirosEmOnibus.set(player.id, new Set());
        this.avaliacao.set(player.id, 100);

        const onibus = mp.vehicles.new(mp.joaat('bus'), player.position, {
            numberPlate: 'MOTORISTA',
            dimension: player.dimension
        });
        onibus.setVariable('isJobVehicle', true);
        onibus.engine = true;

        player.putIntoVehicle(onibus, 0);
        this.onibusMap.set(player.id, onibus);

        player.outputChatBox(`Rota sorteada: ${rota.nome}. Voltas: ${voltas}`);
        this.atualizarHUD(player);
        this.criarBlipsParaRota(player);
        this.criarCheckpoint(player);
    }

    consultarStatus(player: PlayerMp) {
        if (!this.progresso.has(player.id)) {
            return player.outputChatBox('Você não está em serviço como motorista.');
        }
        const avaliacao = this.avaliacao.get(player.id) || 0;
        const passageiros = this.passageirosNPCs.get(player.id)?.filter(p => p.entrouNoOnibus).length || 0;
        player.outputChatBox(`Status do Serviço: Avaliação ${avaliacao}/100 | Passageiros embarcados: ${passageiros}`);
    }

    finalizarTrabalho(player: PlayerMp) {
        if (player.position.subtract(pontoInicialMotorista).length() > 10) {
            return player.outputChatBox('Você deve retornar ao ponto inicial para finalizar o serviço.');
        }

        const embarcados = this.passageirosNPCs.get(player.id)?.filter(p => p.entrouNoOnibus).length || 0;
        const avaliacao = this.avaliacao.get(player.id) || 100;
        const pagamentoBase = 100;
        const pagamentoPorPassageiro = 30;
        const bonusPorAvaliacao = Math.floor(avaliacao / 10);
        const pagamentoTotal = pagamentoBase + (embarcados * pagamentoPorPassageiro) + bonusPorAvaliacao;

        player.outputChatBox(`Trabalho finalizado. Você recebeu $${pagamentoTotal}. Avaliação final: ${avaliacao}/100`);

        this.progresso.delete(player.id);
        this.voltasRestantes.delete(player.id);
        this.rotaMap.delete(player.id);
        this.avaliacao.delete(player.id);
        this.blips.get(player.id)?.forEach(blip => {
            if (blip && blip?.type !== undefined) {
                blip.destroy();
            }
        });
        this.blips.delete(player.id);

        // (Opcional) recria apenas o blip do emprego
        mp.blips.new(513, pontoInicialMotorista, {
            name: 'Emprego: Motorista de Ônibus',
            color: 5,
            shortRange: true
        });

        const onibus = this.onibusMap.get(player.id);
        if (onibus) {
            onibus.destroy();
            this.onibusMap.delete(player.id);
        }

        // Destrói label e checkpoint ativo se existir
        const textos = this.textosDeParada.get(player.id) || [];
        textos.forEach(t => {
            if (t && mp.labels.exists(t)) t.destroy();
        });
        this.textosDeParada.delete(player.id);

        // Remove checkpoint ativo
        if (player.getVariable('motorista:checkpoint')) {
            const cp = player.getVariable('motorista:checkpoint');
            if (mp.checkpoints.exists(cp)) cp.destroy();
            player.setVariable('motorista:checkpoint', null);
        }


        const npcs = this.passageirosNPCs.get(player.id) || [];
        npcs.forEach(p => p.ped.destroy());
        this.passageirosNPCs.delete(player.id);
        this.passageirosEmOnibus.delete(player.id);

        // Remove todos os blips exceto o do ponto inicial
        const todosBlips = this.blips.get(player.id) || [];
        const restantes: BlipMp[] = [];

        todosBlips.forEach(blip => {
            if (
                blip &&
                Math.floor(blip.position.x) !== Math.floor(pontoInicialMotorista.x) &&
                Math.floor(blip.position.y) !== Math.floor(pontoInicialMotorista.y)
            ) {
                blip.destroy();
            } else if (blip) {
                restantes.push(blip); // mantém o blip do ponto inicial
            }
        });

        this.blips.set(player.id, restantes); // só sobrou o blip do ponto inicial

        player.call('motorista:fecharHUD');
    }

    forcarFinalizacao(player: PlayerMp) {
        if (!this.progresso.has(player.id)) {
            return player.outputChatBox('Você não iniciou o trabalho de motorista.');
        }
        this.finalizarTrabalho(player);
    }

    public avancarParaProximoPonto(player: PlayerMp) {
        const rota = this.rotaMap.get(player.id);
        if (!rota) return;

        let index = (this.progresso.get(player.id) || 0) + 1;

        // ⚠ Chegou no final da rota
        if (index >= rota.pontos.length) {
            let voltasRestantes = (this.voltasRestantes.get(player.id) || 1) - 1;

            if (voltasRestantes <= 0) {
                player.call('motorista:waypoint', [pontoInicialMotorista.x, pontoInicialMotorista.y, 'finalizacao']);
                player.outputChatBox('Volte ao ponto inicial para finalizar o serviço com /finalizaronibus.');
                return;
            }

            // 🌀 Reinicia a rota
            this.voltasRestantes.set(player.id, voltasRestantes);
            this.progresso.set(player.id, 0); // ⬅️ reinicia o progresso
            player.outputChatBox(`Nova volta iniciada. Voltas restantes: ${voltasRestantes}`);

            // ✅ Recria blips e checkpoint do ponto inicial
            this.removerBlips(player);
            this.criarBlipsParaRota(player);
            this.atualizarHUD(player);

            // ⬇️ IMPORTANTE: gerar o primeiro checkpoint da nova volta
            setTimeout(() => {
                this.criarCheckpoint(player);
            }, 100); // delay para evitar overlap

            return;
        }

        // Continua normalmente para o próximo ponto
        this.progresso.set(player.id, index);
        this.atualizarHUD(player);
        this.criarCheckpoint(player);
    }



}

export const motoristaController = new MotoristaController();

