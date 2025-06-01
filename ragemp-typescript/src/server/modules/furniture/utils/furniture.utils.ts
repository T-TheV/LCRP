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

  let closest: typeof furnitures[0] | null = null;
  let minDistance = Number.MAX_VALUE;

  for (const furniture of furnitures) {
    const distance = getDistance(playerPos, new mp.Vector3(furniture.posX, furniture.posY, furniture.posZ));
    if (distance < minDistance) {
      minDistance = distance;
      closest = { ...furniture, distance };
    }
  }

  return closest && closest.distance <= 3.5 ? closest : null;
}
/**
 * Verifica se o jogador pode editar a mobília.
 * Aqui você pode adicionar lógica para verificar permissões, etc.
 */
// function canEditFurniture