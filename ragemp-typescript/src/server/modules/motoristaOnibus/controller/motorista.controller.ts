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
    public embarques = new Map<number, number>(); // <- novo
    public desembarques = new Map<number, number>(); // <- novo
    public pontoAtual = new Map<number, { tipo: string; passageiros: number }>();

    public congelarVeiculo(player: PlayerMp, congelar: boolean) {
        const veh = this.onibusMap.get(player.id);
        if (veh) {
            veh.engine = !congelar;
            veh.setVariable('motorista:congelado', congelar);
        }
    }






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

    // 🔁 Atualiza ponto atual com quantidade de passageiros
    const passageiros = this.passageirosNPCs.get(player.id) || [];
    const passageirosNoPonto = passageiros.filter(p =>
        !p.entrouNoOnibus &&
        !p.desembarcou &&
        p.pontoOrigem === index &&
        p.disponivelParaEmbarque
    ).length;

    this.pontoAtual.set(player.id, {
        tipo: ponto.tipo,
        passageiros: passageirosNoPonto
    });

    const checkpoint = mp.checkpoints.new(1, ponto.pos, 3, {
        direction: new mp.Vector3(0, 0, 0),
        color: [255, 200, 0, 100],
        visible: true,
        dimension: player.dimension
    });

    player.setVariable('motorista:checkpoint', checkpoint);

    const label = mp.labels.new(`~y~${ponto.tipo.toUpperCase()}`, ponto.pos, {
        drawDistance: 20,
        dimension: player.dimension
    });

    this.textosDeParada.set(player.id, [label]);
    player.call('motorista:waypoint', [ponto.pos.x, ponto.pos.y, ponto.tipo]);

    const handler = (entity: PlayerMp) => {
        if (entity.id !== player.id) return;

        const onibus = this.onibusMap.get(player.id);
        if (player.vehicle !== onibus) return;

        // 🔚 Limpa o checkpoint e label
        checkpoint.destroy();
        label.destroy();
        mp.events.remove('playerEnterCheckpoint', handler);

        const indexAtual = this.progresso.get(player.id) || 0;
        const pontoTipo = ponto.tipo;

        // 🧹 Remove blip do ponto atual
        const blips = this.blips.get(player.id);
        const blipAtual = blips?.[indexAtual];
        if (blipAtual && pontoTipo !== 'inicio' && mp.blips.exists(blipAtual)) {
            blipAtual.destroy();
            blips![indexAtual] = null as any;
        }

        // 🔄 Desembarque automático
        const embarcados = passageiros.filter(p => p.entrouNoOnibus && !p.desembarcou);
        const candidatos = embarcados.filter(p => p.destinoIndex === indexAtual && mp.peds.exists(p.ped));
        const limite = Math.max(1, Math.floor(embarcados.length * Math.min(0.3 + Math.random() * 0.5, 0.9)));
        const escolhidos = candidatos.sort(() => Math.random() - 0.5).slice(0, limite);

        if (escolhidos.length > 0) {
            this.congelarVeiculo(player, true);
            setTimeout(() => {
                for (const p of escolhidos) {
                    p.desembarcou = true;
                    this.passageirosEmOnibus.get(player.id)?.delete(p);
                    player.call('motorista:npcSair', [p.ped.id, onibus?.id || 0]);
                    player.outputChatBox('🚌 Passageiro desembarcando no destino.');
                }
                this.congelarVeiculo(player, false);
            }, 1000);
        }

        // 🧍 Embarque se for ponto de passageiro
        if (pontoTipo === 'passageiro') {
            const prontosParaSubir = passageiros.filter(p =>
                !p.entrouNoOnibus &&
                !p.desembarcou &&
                p.pontoOrigem === indexAtual &&
                p.disponivelParaEmbarque
            );

            if (prontosParaSubir.length > 0) {
                if (onibus) onibus.engine = false;

                prontosParaSubir.forEach((p, i) => {
                    p.disponivelParaEmbarque = false;
                    (p as any).sendoEmbarcado = true;

                    setTimeout(() => {
                        if (!mp.peds.exists(p.ped) || !onibus) return;

                        const usedSeats = new Set<number>();
                        for (const embarcado of passageiros) {
                            const seat = (embarcado as any).seat;
                            if (embarcado.entrouNoOnibus && seat !== undefined) {
                                usedSeats.add(seat);
                            }
                        }

                        let seat = 1;
                        while (usedSeats.has(seat) && seat < 10) seat++;

                        if (seat >= 10) {
                            p.ped.destroy();
                            player.outputChatBox('❌ Ônibus lotado. Passageiro não pôde embarcar.');
                            return;
                        }

                        (p as any).seat = seat;
                        player.call('motorista:npcEntrar', [p.ped.id, onibus.id, seat]);
                    }, i * 3000);
                });

                player.outputChatBox(`🧍 ${prontosParaSubir.length} passageiro${prontosParaSubir.length > 1 ? 's' : ''} aguardando embarque...`);
            }

            return;
        }

        // 🎯 Fim da rota
        if (pontoTipo === 'fim') {
            const voltas = (this.voltasRestantes.get(player.id) || 1) - 1;

            if (voltas <= 0) {
                player.call('motorista:waypoint', [
                    pontoInicialMotorista.x,
                    pontoInicialMotorista.y,
                    'fim'
                ]);
                player.outputChatBox('✅ Volte ao ponto inicial para finalizar o serviço com /finalizaronibus.');
                return;
            }

            this.voltasRestantes.set(player.id, voltas);
            this.progresso.set(player.id, 0);
            player.outputChatBox(`🔁 Nova volta iniciada. Voltas restantes: ${voltas}`);
            this.atualizarHUD(player);

            setTimeout(() => {
                this.criarCheckpoint(player);
            }, 100);

            return;
        }

        // ➕ Avança normalmente
        this.avancarParaProximoPonto(player);
    };

    mp.events.add('playerEnterCheckpoint', handler);
}










    iniciarTrabalho(player: PlayerMp) {
    if (this.progresso.has(player.id)) {
        return player.outputChatBox('🚫 Você já iniciou o trabalho de motorista.');
    }
    if (player.vehicle) {
        return player.outputChatBox('❗ Saia do veículo para iniciar o trabalho.');
    }
    if (player.position.subtract(pontoInicialMotorista).length() > 10) {
        return player.outputChatBox('📍 Vá até o ponto de emprego para iniciar.');
    }

    const rota = rotasDeOnibus[Math.floor(Math.random() * rotasDeOnibus.length)];
    const voltas = 2 + Math.floor(Math.random() * 3);

    this.rotaMap.set(player.id, rota);
    this.progresso.set(player.id, 0);
    this.voltasRestantes.set(player.id, voltas);
    this.passageirosNPCs.set(player.id, []);
    this.passageirosEmOnibus.set(player.id, new Set());
    this.avaliacao.set(player.id, 100);

    const onibus = mp.vehicles.new(mp.joaat('bus'), player.position, {
        numberPlate: 'AUGAYSTO',
        dimension: player.dimension,
        color: [[255, 255, 0], [255, 255, 0]],
    });
    onibus.setVariable('isJobVehicle', true);
    onibus.engine = true;

    player.putIntoVehicle(onibus, 0);
    this.onibusMap.set(player.id, onibus);

    // 🎯 Pré-criação de todos os NPCs nos pontos de passageiros
    const pontos = rota.pontos;
    const passageiros: PassageiroNPC[] = [];

    pontos.forEach((pontoOrigem, indexOrigem) => {
        if (pontoOrigem.tipo !== 'passageiro') return;

        const pos = pontoOrigem.pos_passageiro || pontoOrigem.pos;
        const skin = npcModelos[Math.floor(Math.random() * npcModelos.length)];

        const npc = mp.peds.new(mp.joaat(skin), pos, {
            heading: 0,
            dimension: player.dimension
        });

        // Define destino para esse passageiro entre os próximos pontos
        const destinosPossiveis = pontos
            .map((p, i) => ({ ponto: p, index: i }))
            .filter(p => p.index > indexOrigem && (p.ponto.tipo === 'passageiro' || p.ponto.tipo === 'fim'));

        let destinoIndex = pontos.length - 1;
        if (destinosPossiveis.length > 0) {
            const sorteado = destinosPossiveis[Math.floor(Math.random() * destinosPossiveis.length)];
            destinoIndex = sorteado.index;
        }

        const passageiro: PassageiroNPC = {
            ped: npc,
            destinoIndex,
            entrouNoOnibus: false,
            desembarcou: false,
            pontoOrigem: indexOrigem,         // <- NOVO: saber em qual ponto ele será embarcado
            disponivelParaEmbarque: true      // <- NOVO: controle de embarque único
        } as any;

        passageiros.push(passageiro);
    });

    this.passageirosNPCs.set(player.id, passageiros);

    player.outputChatBox(`🚌 Rota sorteada: ${rota.nome} | Voltas: ${voltas}`);
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
        const pagamentoBase = 500;
        const pagamentoPorPassageiro = 50;
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
        this.embarques.delete(player.id);
        this.desembarques.delete(player.id);
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

