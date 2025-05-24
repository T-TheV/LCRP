// src/server/modules/trucking/types/extendedPlayer.d.ts
export {}; // mantém o arquivo como módulo

declare global {
  interface PlayerMp {
    /** Flag futura para permissões de staff */
    isAdmin?: boolean;

    /** Ajusta saldo (positivo = recebe, negativo = paga) */
    giveMoney?: (amount: number) => void;

    /** Distância 3-D até um ponto (wrapper para distanceTo) */
    dist(pos: Vector3): number;
  }
}
