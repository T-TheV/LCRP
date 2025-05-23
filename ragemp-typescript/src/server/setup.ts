import path from 'path';
import { config } from 'dotenv';

/* Carrega .env raiz do projeto */
config({ path: path.resolve('.env') });
console.log('[BOOT] setup.ts executado.');

/* Mensagens básicas de join/quit */
mp.events.add('playerJoin', (player: PlayerMp) => {
  console.log(`${player.name} entrou no servidor!`);
  player.outputChatBox('🎉 Bem-vindo ao servidor Liberty City RP!');
});

mp.events.add('playerQuit', (player: PlayerMp) => {
  console.log(`${player.name} saiu do servidor!`);
});
mp.events.add('playerDeath', (player: PlayerMp) => {
  console.log(`${player.name} morreu!`);
  player.outputChatBox('💀 Você morreu!');
});