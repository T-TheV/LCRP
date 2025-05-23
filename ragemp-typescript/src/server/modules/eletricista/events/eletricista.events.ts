import electricistaController from '../controller/eletricista.controller';
import { pontosDeReparo } from '../data/pontos';
import { pontoInicialEletricista } from '../data/pontos';

class ElectricistaEvents {
    constructor() {
        this.registerCommands();
    }

    private registerCommands(): void {
        // Inicia o trabalho com a van
        mp.events.addCommand('iniciartrabalho', (player: PlayerMp) => {
            electricistaController.iniciarTrabalho(player);
        });

        // Realiza o reparo
        mp.events.addCommand('reparoeletrico', (player: PlayerMp) => {
            electricistaController.startElectricalRepair(player);
        });

        // Teleporta o jogador para o ponto atual do reparo
        mp.events.addCommand('tpe', (player: PlayerMp) => {
            const progressoAtual = electricistaController['progresso'].get(player.id);

            if (progressoAtual === undefined) {
                player.outputChatBox('❗ Você ainda não iniciou o trabalho. Use /iniciartrabalho.');
                return;
            }

            if (progressoAtual >= pontosDeReparo.length) {
                player.outputChatBox('✅ Você já completou todos os pontos de reparo.');
                return;
            }

            const destino = pontosDeReparo[progressoAtual];

            // Corrigido: teleporte direto com Z seguro
            player.position = new mp.Vector3(destino.x, destino.y, destino.z + 1); // subir 1 unidade pra garantir
            player.outputChatBox(`📍 Você foi levado até o ponto ${progressoAtual + 1}/${pontosDeReparo.length} do serviço.`);
        });
        mp.events.addCommand('finalizartrabalho', (player) => {
            electricistaController.finalizarEntrega(player);
        });
        mp.events.addCommand('tpeletricista', (player: PlayerMp) => {
            player.position = new mp.Vector3(
                pontoInicialEletricista.x,
                pontoInicialEletricista.y,
                pontoInicialEletricista.z + 1 // sobe 1 unidade pra garantir que não bugue no chão
            );

            player.outputChatBox('📍 Você foi teleportado para o ponto de início do trabalho de eletricista.');
});
    }
    
}

export default new ElectricistaEvents();
