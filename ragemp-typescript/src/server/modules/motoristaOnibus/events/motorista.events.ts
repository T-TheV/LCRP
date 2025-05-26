import { motoristaController } from '../controller/motorista.controller';
import { pontoInicialMotorista } from '../data/motorista.data';


mp.events.add('playerExitVehicle', (player: PlayerMp, vehicle: VehicleMp) => {
    if (vehicle && vehicle.getVariable('isJobVehicle') && motoristaController['onibusMap'].has(player.id)) {
        player.outputChatBox('Você saiu do ônibus. Para finalizar o serviço, use /finalizaronibus.');
    }
});

mp.events.add('playerQuit', (player: PlayerMp) => {
    if (motoristaController['onibusMap'].has(player.id)) {
        motoristaController.forcarFinalizacao(player);
    }
});

mp.events.add('playerDeath', (player: PlayerMp) => {
    if (motoristaController['onibusMap'].has(player.id)) {
        player.outputChatBox('Você morreu durante o serviço de motorista. Seu trabalho foi encerrado.');
        motoristaController.forcarFinalizacao(player);
    }
});

mp.blips.new(513, pontoInicialMotorista, {
    name: 'Emprego: Motorista de Ônibus',
    color: 5,
    shortRange: true
});


mp.events.add('motorista:confirmarEntrada', (player: PlayerMp, npcId: number) => {
    const lista = motoristaController.passageirosNPCs.get(player.id) || [];
    const passageiro = lista.find(p => p.ped.id === npcId);
    if (!passageiro) return;

    passageiro.entrouNoOnibus = true;
    motoristaController.passageirosEmOnibus.get(player.id)?.add(passageiro);

    const veh = motoristaController.onibusMap.get(player.id);
    if (veh && veh.getVariable('isJobVehicle')) {
        veh.engine = true;
        veh.setVariable('motorista:congelado', false);
    }

    player.outputChatBox('Passageiro embarcou. Continue a rota.');
    motoristaController.avancarParaProximoPonto(player);
});
mp.events.add('motorista:confirmarDesembarque', (player: PlayerMp, npcId: number) => {
    const lista = motoristaController.passageirosNPCs.get(player.id) || [];
    const passageiro = lista.find(p => p.ped.id === npcId);
    if (!passageiro || !passageiro.entrouNoOnibus) return;

    motoristaController.passageirosEmOnibus.get(player.id)?.delete(passageiro);
    player.call('motorista:npcSair', [passageiro.ped.id, motoristaController.onibusMap.get(player.id)?.id || 0]);
    player.outputChatBox('Passageiro desembarcou com sucesso.');
});