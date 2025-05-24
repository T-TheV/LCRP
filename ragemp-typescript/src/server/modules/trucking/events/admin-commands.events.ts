// src/server/modules/trucking/data/ranks.ts
// -----------------------------------------
// Define a progressão de motorista (rank) para o Truck Job.

export interface Rank {
  id: number;
  label: string;
  hours: number;              // horas mínimas para alcançar
  allowedVehModels: number[]; // joaat dos veículos liberados
  capacity: number;           // limite de caixas
}

const hash = mp.joaat; // helper

export const RANKS: Rank[] = [
  {
    id: 1,
    label: 'Courier Trainee',
    hours: 0,
    allowedVehModels: [
      hash('sadler'),
      hash('picador'),
    ],
    capacity: 4,
  },
  {
    id: 2,
    label: 'Courier',
    hours: 12,                // ≈ 120 caixas
    allowedVehModels: [
      hash('bobcatxl'),
      hash('yosemite'),
      hash('boxville'),
    ],
    capacity: 6,
  },
  {
    id: 3,
    label: 'Professional Trucker',
    hours: 30,                // ≈ 300 caixas
    allowedVehModels: [
      hash('phantom'),
      hash('packer'),
      hash('hauler'),
    ],
    capacity: 10,
  },
];

/** Próximo rank a partir do atual (opcional) */
export function nextRank(current: Rank | undefined): Rank | undefined {
  if (!current) return RANKS[0];
  return RANKS.find((r) => r.hours > current.hours);
}
