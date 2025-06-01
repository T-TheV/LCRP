import { furnitureController } from '../controller/furniture.controller';

console.log('[Furniture] Comandos carregados.');

/**
 * Comando /mobilias
 * Abre o menu principal de mobílias para o jogador.
 * Agora pode ser usado em qualquer lugar, não exige estar dentro de propriedade.
 */
mp.events.addCommand('mobilias', (player: PlayerMp) => {
  furnitureController.openFurnitureMenu(player);
});
