// src/server/modules/trucking/data/cargo-types.ts
// -----------------------------------------------
// Lista de cargas disponíveis para o Truck Job.
// Basta acrescentar novas strings no union‑type e no array.

export type CargoType =
  | 'Combustível'
  | 'Algodão'
  | 'Aço'
  | 'Produtos Químicos'
  | 'Eletrônicos';

/** Array utilitário (usado para sortear tipo de carga no controller) */
export const CARGO_TYPES: CargoType[] = [
  'Combustível',
  'Algodão',
  'Aço',
  'Produtos Químicos',
  'Eletrônicos',
];
