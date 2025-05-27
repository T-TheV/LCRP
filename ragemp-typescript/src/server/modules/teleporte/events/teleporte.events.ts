import { verificarInteracaoTeleporte } from '../controller/teleporte.controller';

mp.events.add('teleporte:verificarInteracao', (player: PlayerMp) => {
  if (!player) return;
  verificarInteracaoTeleporte(player);
});
