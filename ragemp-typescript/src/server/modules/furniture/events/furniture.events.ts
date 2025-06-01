// server/modules/furniture/events/furniture.events.ts

import { furnitureController } from '../controller/furniture.controller';

mp.events.add('furniture:closeMenu', (player: PlayerMp) => {
  player.invincible = false;
  player.currentPropertyId = undefined;
});

mp.events.add('furniture:preview', (player: PlayerMp, model: string) => {
  furnitureController.previewFurniture(player, model);
});

mp.events.add('furniture:confirmPlacement', (player: PlayerMp, pos: Vector3, rot: Vector3, model: string) => {
  furnitureController.placeFurniture(player, pos, rot, model);
});

mp.events.add('furniture:removeClosest', (player: PlayerMp) => {
  furnitureController.removeFurniture(player);
});

mp.events.add('furniture:buyItem', (player, model: string, price: number) => {
  furnitureController.buyItem(player, model, price);
});

mp.events.add('furniture:reloadFurnitures', (player: PlayerMp) => {
  furnitureController.openFurnitureMenu(player);
});
