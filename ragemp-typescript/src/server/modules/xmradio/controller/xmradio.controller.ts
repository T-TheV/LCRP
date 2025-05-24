// server/xmradio/controller/xmradio.controller.ts

// Importe a função do arquivo de eventos
// O caminho '../events/xmradio.events' assume que 'controller' e 'events' são pastas irmãs dentro de 'xmradio'
// Ajuste o caminho se a sua estrutura for diferente.
import { getAllOccupants } from '../events/xmradio.events';

mp.events.addCommand('colocarxmradio', (player: PlayerMp) => {
    if (!player.vehicle) {
        return player.outputChatBox("!{#FF0000}ERRO: !{#FFFFFF}Você precisa estar em um veículo.");
    }
    player.vehicle.setVariable('hasXMRadio', true);
    player.outputChatBox(`!{#00FF00}SUCESSO: !{#FFFFFF}XM Radio instalado neste veículo (ID: ${player.vehicle.id}).`);
    player.outputChatBox("Use !{#00FF00}/xmradio !{#FFFFFF}quando estiver dentro para abrir a interface e controlar o rádio.");
});

mp.events.addCommand('removerxmradio', (player: PlayerMp) => {
    if (!player.vehicle) {
        return player.outputChatBox("!{#FF0000}ERRO: !{#FFFFFF}Você precisa estar em um veículo.");
    }

    if (player.vehicle.getVariable('hasXMRadio') === true) {
        player.vehicle.setVariable('hasXMRadio', undefined);

        player.vehicle.setVariable('xmRadio_isPlaying', false);
        player.vehicle.setVariable('xmRadio_url', null);
        player.vehicle.setVariable('xmRadio_name', null);
        player.vehicle.setVariable('xmRadio_volume', null);
        player.vehicle.setVariable('xmRadio_djId', null);

        // Agora usando a função importada
        const occupants = getAllOccupants(player.vehicle);
        occupants.forEach((occupant: PlayerMp) => {
            occupant.call('client:xmradio:syncStation', [null, null, false, 0.5]);
        });
        
        player.outputChatBox(`!{#00FF00}SUCESSO: !{#FFFFFF}XM Radio removido e desligado deste veículo (ID: ${player.vehicle.id}).`);
    } else {
        player.outputChatBox("!{#FF8C00}AVISO: !{#FFFFFF}Este veículo não possui XM Radio instalado.");
    }
});

// A DEFINIÇÃO DUPLICADA DE getAllOccupants FOI REMOVIDA DAQUI

console.log('[SERVER] Módulo de Controle XM Radio (usando getAllOccupants importado) carregado.');