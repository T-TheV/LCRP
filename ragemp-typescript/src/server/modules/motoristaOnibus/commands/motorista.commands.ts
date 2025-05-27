import { motoristaController } from '../controller/motorista.controller';
import { pontoInicialMotorista } from '../data/motorista.data';

mp.events.addCommand('iniciaronibus', (player: PlayerMp) => {
  motoristaController.iniciarTrabalho(player);
});

mp.events.addCommand('finalizaronibus', (player: PlayerMp) => {
  motoristaController.forcarFinalizacao(player);
});

mp.events.addCommand('statusonibus', (player: PlayerMp) => {
  motoristaController.consultarStatus(player);
});

mp.events.addCommand('tpmo', (player: PlayerMp) => {
  player.position = pontoInicialMotorista;
  player.outputChatBox('Você foi teleportado para o emprego de Motorista de Ônibus.');
});