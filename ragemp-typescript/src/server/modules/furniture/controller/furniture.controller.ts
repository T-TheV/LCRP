import { getClosestFurniture, getDistance } from '../utils/furniture.utils';
import { PropertyFurniture } from '../types/furniture.types';

const properties: {
  id: string;
  entrance: Vector3;
  dimension: number;
  ownerId: string;
  furnitures: PropertyFurniture[];
}[] = [];

const placedObjects: Map<string, ObjectMp> = new Map();

class FurnitureController {
  public openFurnitureMenu(player: PlayerMp): void {
    const playerPos = player.position;
    const dimension = player.dimension;

    let property = properties.find((p) => {
      const entrance = new mp.Vector3(p.entrance.x, p.entrance.y, p.entrance.z);
      return p.dimension === dimension && getDistance(playerPos, entrance) <= 3.5;
    });

    if (!property) {
      property = {
        id: `temp-${player.id}`,
        entrance: playerPos,
        dimension,
        ownerId: player.socialClub || player.name,
        furnitures: [],
      };
      properties.push(property);
      console.log(`[Furniture] Criada propriedade temporária para ${player.name}`);
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

  public previewFurniture(player: PlayerMp, model: string): void {
    if (!model) {
      player.sendNotification?.('error', 'Modelo inválido.');
      return;
    }

    player.call('furniture:preview', [model]);
    console.log(`[Furniture] ${player.name} está pré-visualizando o modelo ${model}`);
  }

  public async placeFurniture(player: PlayerMp, pos: Vector3, rot: Vector3, model: string): Promise<void> {
    const tempBuy = player.getVariable('buyingFurniture') as { model: string, price: number } | undefined;
    const isFromShop = !!tempBuy;

    if (isFromShop && tempBuy?.model !== model) {
      player.sendNotification?.('error', 'Modelo de mobília inconsistente.');
      return;
    }

    const id = Date.now().toString();

    const furniture: PropertyFurniture = {
      id,
      propertyId: player.currentPropertyId || 'free',
      model,
      posX: pos.x,
      posY: pos.y,
      posZ: pos.z,
      rotX: rot.x,
      rotY: rot.y,
      rotZ: rot.z,
      interior: player.dimension !== 0,
    };

    let property = properties.find(p => p.id === player.currentPropertyId);
    if (!property) {
      property = properties.find(p => p.id === 'free');
      if (!property) {
        property = {
          id: 'free',
          entrance: pos,
          dimension: player.dimension,
          ownerId: player.name,
          furnitures: []
        };
        properties.push(property);
      }
    }

    property.furnitures.push(furniture);
    player.setVariable('buyingFurniture', null);

    const obj = mp.objects.new(mp.joaat(model), new mp.Vector3(pos.x, pos.y, pos.z), {
      rotation: new mp.Vector3(rot.x, rot.y, rot.z),
      dimension: player.dimension
    });

    placedObjects.set(furniture.id, obj);

    player.call('furniture:confirmPlacement');
    player.sendNotification?.('success', `Mobília "${model}" posicionada com sucesso.`);
    console.log(`[Furniture] ${player.name} posicionou mobília ${model}`);
    console.log(`[AUDITORIA] ${player.name} posicionou mobília id=${furniture.id}, model=${model}, pos=(${pos.x}, ${pos.y}, ${pos.z}), rot=(${rot.x}, ${rot.y}, ${rot.z})`);
  }

  public editFurniture(player: PlayerMp, id: string, newPos: Vector3, newRot: Vector3): void {
    const property = properties.find(p => p.id === player.currentPropertyId);
    if (!property) return;

    const furniture = property.furnitures.find(f => f.id === id);
    if (!furniture) return;

    furniture.posX = newPos.x;
    furniture.posY = newPos.y;
    furniture.posZ = newPos.z;
    furniture.rotX = newRot.x;
    furniture.rotY = newRot.y;
    furniture.rotZ = newRot.z;

    const obj = placedObjects.get(id);
    if (obj) {
      obj.position = new mp.Vector3(newPos.x, newPos.y, newPos.z);
      obj.rotation = new mp.Vector3(newRot.x, newRot.y, newRot.z);
    }


    player.sendNotification?.('success', `Mobília "${furniture.model}" atualizada.`);
    console.log(`[Furniture] ${player.name} atualizou mobília ${furniture.model}`);
    console.log(`[AUDITORIA] ${player.name} EDITOU mobília id=${id}, novaPos=(${newPos.x}, ${newPos.y}, ${newPos.z}), novaRot=(${newRot.x}, ${newRot.y}, ${newRot.z})`);
  }

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

    const object = placedObjects.get(closest.id);
    if (object) {
      object.destroy();
      placedObjects.delete(closest.id);
    }

    property.furnitures = property.furnitures.filter((f) => f.id !== closest.id);
    player.call('furniture:removeModel', [closest.model]);
    player.sendNotification?.('success', `Mobília "${closest.model}" removida.`);
    console.log(`[Furniture] ${player.name} removeu mobília ${closest.model} da propriedade ${property.id}`);
    console.log(`[AUDITORIA] ${player.name} REMOVEU mobília id=${closest.id}, model=${closest.model}`);
  }

  public buyItem(player: PlayerMp, model: string, price: number): void {
    if (!model || !price || price <= 0) {
      player.sendNotification?.('error', 'Item inválido.');
      player.outputChatBox(`Você tentou comprar um item inválido: "${model}" com preço ${price}.`);
      console.log(`[Furniture] ${player.name} tentou comprar um item inválido: "${model}" com preço ${price}.`);
      return;
    }

    const currentMoney = player.getVariable('money');

    if (typeof currentMoney !== 'number' || currentMoney < price) {
      player.sendNotification?.('error', 'Saldo insuficiente.');
      player.outputChatBox(`Você não tem dinheiro suficiente para comprar "${model}".`);
      console.log(`[Furniture] ${player.name} tentou comprar "${model}" mas não tinha dinheiro suficiente.`);
      return;
    }

    player.setVariable('buyingFurniture', { model, price });
    player.setVariable('money', currentMoney - price);
    player.sendNotification?.('success', `Você comprou a mobília "${model}". Posicione-a agora.`);
    player.outputChatBox(`Você comprou a mobília "${model}" por $${price}. Posicione-a agora.`);
    console.log(`[Furniture] ${player.name} comprou a mobília "${model}" por $${price}.`);
    console.log(`[AUDITORIA] ${player.name} COMPROU mobília model=${model}, price=${price}, saldoAntigo=${currentMoney}, saldoAtual=${currentMoney - price}`);

    player.call('furniture:preview', [model]);
    console.log(`[Furniture] ${player.name} está posicionando a mobília comprada: ${model}`);
  }
}

export const furnitureController = new FurnitureController();
