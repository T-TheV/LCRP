// src/server/modules/trucking/events/server.events.ts
// ---------------------------------------------------
// Hooks globais do Truck Job.
// • Aplica multa e devolve estoque se o jogador sair com carga ativa.

import { truckingController } from '../controller/trucking.controller';

/* Player quit (saindo do servidor) */
mp.events.add('playerQuit', (player: PlayerMp) => {
  truckingController.cancel(player, 'saiu do servidor durante o transporte');
});
