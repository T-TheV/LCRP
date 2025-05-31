// server/modules/furniture/utils/furniture.utils.ts

/**
 * Retorna a distância entre dois vetores.
 */
export function getDistance(pos1: Vector3, pos2: Vector3): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Retorna a mobília mais próxima do jogador com base na posição.
 */
export function getClosestFurniture(
  player: PlayerMp,
  furnitures: {
    id: string;
    model: string;
    posX: number;
    posY: number;
    posZ: number;
    [key: string]: any;
  }[]
) {
  const playerPos = player.position;

  const closest = furnitures
    .map((f) => ({
      ...f,
      distance: getDistance(playerPos, new mp.Vector3(f.posX, f.posY, f.posZ)),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return closest?.distance <= 3.5 ? closest : null;
}

/**
 * Verifica se o jogador tem permissão para editar mobílias da propriedade.
 */
export function canEditFurniture(
  player: PlayerMp,
  property: {
    ownerId: string;
    factionId?: string;
    companyId?: string;
  }
): boolean {
  const isAdmin = player.getVariable('adminDuty') === true;

  if (isAdmin) return true;

  const hasFaction = player.hasFactionPermission?.('furniture') === true;
  const hasCompany = player.hasCompanyPermission?.('furniture') === true;

  if (property.factionId && !hasFaction) return false;
  if (property.companyId && !hasCompany) return false;

  return property.ownerId === player.getVariable('characterId');
}
