import path from 'path';
import { config } from 'dotenv';

config({
  path: path.resolve('.env')
});
console.log('[BOOT] setup.ts foi executado com sucesso.');

mp.events.add('playerJoin', (player: PlayerMp) => {
  console.log(`${player.name} entrou no servidor!`);
  player.outputChatBox('🎉 Bem-vindo ao servidor Liberty City RP!');
  player.giveMoney = (amount) => {
    player.outputChatBox(`Você recebeu $${amount}`);
  };
});
mp.events.add('playerDisconnect', (player: PlayerMp) => {
  console.log(`${player.name} saiu do servidor!`);
  player.outputChatBox('Você saiu do servidor.');
});



