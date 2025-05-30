import { encontrarTeleporteProximo } from '../data/teleporte.data';

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

/**
 * Teleporta o jogador ou veículo com ocupantes para o destino
 */
function teleportarJogador(player: PlayerMp, destino: Vector3): void {
  const vehicle = player.vehicle;

  if (vehicle && vehicle.getOccupant(0) === player) {
    // Jogador é o motorista – teleporta o veículo
    vehicle.position = destino;

    // Tenta teleportar todos os ocupantes (motorista + passageiros)
    for (let seat = 0; seat <= 6; seat++) {
      const occupant = vehicle.getOccupant(seat);
      if (occupant) occupant.position = destino;
    }
  } else {
    // A pé ou passageiro – teleporta apenas o jogador
    player.position = destino;
  }
}


/**
 * Verifica se o jogador está próximo de um ponto de teleporte e executa o teleporte
 */
export function verificarInteracaoTeleporte(player: PlayerMp): void {
  const pos = player.position;
  const tele = encontrarTeleporteProximo(pos, 2);

  if (!tele || !tele.entrada || !tele.saida) return;

  const indoParaSaida = getDistance(pos, tele.entrada) <= 2;
  const destino = indoParaSaida ? tele.saida : tele.entrada;

  teleportarJogador(player, destino);
}
