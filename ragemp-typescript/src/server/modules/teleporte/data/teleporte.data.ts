import { Teleporte } from '../types/teleporte.types';

const teleportes = new Map<number, Teleporte>();
let contadorId = 0;

/**
 * Calcula a distância entre dois pontos 3D
 */
function getDistance(a: Vector3, b: Vector3): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2) +
    Math.pow(a.z - b.z, 2)
  );
}

export function criarTeleporte(nome: string, entrada: Vector3): Teleporte {
  const id = ++contadorId;
  const novo: Teleporte = { id, nome, entrada };
  teleportes.set(id, novo);
  return novo;
}

export function definirSaida(nomeOuId: string | number, saida: Vector3): boolean {
  const tele = encontrarPorNomeOuId(nomeOuId);
  if (!tele) return false;
  tele.saida = saida;
  return true;
}

export function deletarTeleporte(nomeOuId: string | number): boolean {
  const tele = encontrarPorNomeOuId(nomeOuId);
  if (!tele) return false;
  return teleportes.delete(tele.id);
}

export function encontrarTeleporteProximo(pos: Vector3, distancia = 2): Teleporte | undefined {
  for (const tele of teleportes.values()) {
    if (tele.entrada && getDistance(pos, tele.entrada) <= distancia) return tele;
    if (tele.saida && getDistance(pos, tele.saida) <= distancia) return tele;
  }
  return undefined;
}

export function encontrarPorNomeOuId(nomeOuId: string | number): Teleporte | undefined {
  const idNum = Number(nomeOuId);
  for (const tele of teleportes.values()) {
    if (tele.nome === nomeOuId || tele.id === idNum) return tele;
  }
  return undefined;
}

export function listarTeleportes(): Teleporte[] {
  return Array.from(teleportes.values());
}
