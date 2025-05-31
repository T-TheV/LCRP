import { furnitureController } from '../controller/furniture.controller';

console.log('[Furniture] Comandos carregados.');

/**
 * Comando /mobilias
 * Abre o menu principal de mobílias para o jogador.
 */
mp.events.addCommand('mobilias', (player: PlayerMp) => {
  furnitureController.openFurnitureMenu(player);
});

/**
 * Comando /testfurn
 * Abre o menu de mobílias com dados fictícios para testes de interface.
 */
mp.events.addCommand('testfurn', (player: PlayerMp) => {
  console.log(`[Furniture] Comando testfurn chamado por ${player.name}`);

  const mockData = JSON.stringify([
    {
      id: '1',
      name: 'Cadeira Gamer',
      model: 'prop_chair_01b',
      distance: 0.8,
      value: 300,
      useSlot: true
    }
  ]);

  const mockCategories = JSON.stringify([]); // ainda vazio

  player.call('cef:furniture:open', [
    'propriedade_fake',
    20, // limite de mobílias
    mockCategories,
    mockData,
    0,
    1
  ]);
});


/**
 * Comando /previewfurn [model]
 * Gera uma mobília em modo de pré-visualização para o jogador.
 */
// mp.events.addCommand('pvf', (player: PlayerMp, fullText: string) => {
//   const model = fullText.trim();

//   if (!model) {
//     player.sendNotification?.('error', 'Usage: /pvf [model]');
//     return;
//   }

//   furnitureController.previewFurniture(player, model);
//   player.sendNotification?.('info', `Previewing model: ${model}`);
//   console.log(`[Furniture] ${player.name} is previewing furniture model: ${model}`);
// });
