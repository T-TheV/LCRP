// server/modules/furniture/controller/furniture.controller.ts

import { canEditFurniture, getClosestFurniture, getDistance } from '../utils/furniture.utils';
import { PropertyFurniture } from '../types/furniture.types';

// Simulação temporária de base de dados de propriedades
const properties: {
  id: string;
  entrance: Vector3;
  dimension: number;
  ownerId: string;
  furnitures: PropertyFurniture[];
}[] = [];

class FurnitureController {
  /**
   * Abre o menu de mobílias caso o jogador esteja próximo de uma propriedade válida
   */
  public openFurnitureMenu(player: PlayerMp): void {
    const playerPos = player.position;
    const dimension = player.dimension;

    const property = properties.find((p) => {
      const entrance = new mp.Vector3(p.entrance.x, p.entrance.y, p.entrance.z);
      return p.dimension === dimension && getDistance(playerPos, entrance) <= 3.5;
    });

    if (!property) {
      player.sendNotification?.('error', 'Você não está próximo de uma propriedade válida.');
      return;
    }

    if (!canEditFurniture(player, property)) {
      player.sendNotification?.('error', 'Você não tem permissão para editar esta propriedade.');
      return;
    }

    player.currentPropertyId = property.id;
    player.invincible = true;

    const furnituresData = property.furnitures.map((f) => ({
      id: f.id,
      model: f.model,
      position: { x: f.posX, y: f.posY, z: f.posZ },
      rotation: { x: f.rotX, y: f.rotY, z: f.rotZ },
    }));

    player.call('furniture:openUI', [JSON.stringify(furnituresData)]);
    console.log(`[Furniture] Menu aberto para ${player.name} na propriedade ${property.id}`);
  }

  /**
   * Envia um modelo para pré-visualização de mobília ao jogador
   */
  public previewFurniture(player: PlayerMp, model: string): void {
    if (!model) {
      player.sendNotification?.('error', 'Modelo inválido.');
      return;
    }

    player.call('furniture:preview', [model]);
    console.log(`[Furniture] ${player.name} está pré-visualizando o modelo ${model}`);
  }

  /**
   * Posiciona e salva a mobília colocada
   */
  public async placeFurniture(player: PlayerMp, pos: Vector3, rot: Vector3, model: string): Promise<void> {
    if (!player.currentPropertyId) {
      player.sendNotification?.('error', 'Você não está vinculado a nenhuma propriedade.');
      return;
    }

    const property = properties.find((p) => p.id === player.currentPropertyId);
    if (!property) return;

    const furniture: PropertyFurniture = {
      id: Date.now().toString(),
      propertyId: property.id,
      model,
      posX: pos.x,
      posY: pos.y,
      posZ: pos.z,
      rotX: rot.x,
      rotY: rot.y,
      rotZ: rot.z,
      interior: player.dimension !== 0,
    };

    property.furnitures.push(furniture);

    player.call('furniture:confirmPlacement');
    player.sendNotification?.('success', `Mobília "${model}" posicionada com sucesso.`);
    console.log(`[Furniture] ${player.name} posicionou mobília ${model} na propriedade ${property.id}`);
  }

  /**
   * Remove a mobília mais próxima do jogador
   */
  public removeFurniture(player: PlayerMp): void {
    if (!player.currentPropertyId) {
      player.sendNotification?.('error', 'Você não está vinculado a nenhuma propriedade.');
      return;
    }

    const property = properties.find((p) => p.id === player.currentPropertyId);
    if (!property) return;

    const closest = getClosestFurniture(player, property.furnitures);
    if (!closest) {
      player.sendNotification?.('error', 'Nenhuma mobília próxima encontrada.');
      return;
    }

    property.furnitures = property.furnitures.filter((f) => f.id !== closest.id);
    player.call('furniture:removeModel', [closest.model]);
    player.sendNotification?.('success', `Mobília "${closest.model}" removida.`);
    console.log(`[Furniture] ${player.name} removeu mobília ${closest.model} da propriedade ${property.id}`);
  }
  public buyItem(player: PlayerMp, model: string, price: number): void {
  if (!model || !price || price <= 0) {
    player.sendNotification?.('error', 'Item inválido.');
    return;
  }

  const currentMoney = player.getVariable('money');

  if (typeof currentMoney !== 'number' || currentMoney < price) {
    player.sendNotification?.('error', 'Saldo insuficiente.');
    return;
  }

  player.setVariable('money', currentMoney - price);

  player.sendNotification?.('success', `Você comprou a mobília: ${model} por $${price}`);
}


}

export const furnitureController = new FurnitureController();
