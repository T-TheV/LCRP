// src/server/modules/trucking/data/industries.ts
// ----------------------------------------------
// • Carrega e persiste as indústrias (JSON).
// • Helpers para criar blip/label e achar indústria próxima.

import fs from 'fs';

export type IndustryType = 'primary' | 'secondary' | 'tertiary';

export interface Industry {
  id: number;
  name: string;
  type: IndustryType;
  pos: Vector3;
  stock: number;
  stockMax: number;
  priceBuy: number;   // preço que a indústria paga
  priceSell: number;  // preço que a indústria cobra
}

/* Persistência em JSON */
export const DATA_PATH = 'server-data/industries.json';

export function loadIndustries(): Industry[] {
  if (fs.existsSync(DATA_PATH))
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  if (!fs.existsSync('server-data')) fs.mkdirSync('server-data');

  const seed: Industry[] = [
    {
      id: 1,
      name: 'Refinaria Green Palms',
      type: 'primary',
      pos: new mp.Vector3(2145.6, 897.2, 10.8),
      stock: 5000,
      stockMax: 5000,
      priceBuy: 0,
      priceSell: 300,
    },
  ];

  fs.writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2));
  return seed;
}

/* Array vivo utilizado pelo servidor */
export const INDUSTRIES: Industry[] = loadIndustries();

/* Salva alterações em disco */
export const saveIndustries = () =>
  fs.writeFileSync(DATA_PATH, JSON.stringify(INDUSTRIES, null, 2));

/* Helpers ---------------------------------------------------- */
export function spawnBlipAndLabel(ind: Industry) {
  const color = ind.type === 'primary' ? 2 : ind.type === 'secondary' ? 5 : 3;

  mp.blips.new(618, ind.pos, {
    color,
    name: ind.name,
    shortRange: true,
  });

  mp.labels.new(
    `[${ind.name}]\n/industry info`,
    ind.pos,
    { drawDistance: 25, los: false },
  );
}

export function findNearestIndustry(
  player: PlayerMp,
  maxDist = 3,
): Industry | undefined {
  return INDUSTRIES.find((ind) => player.dist!(ind.pos) < maxDist);
}

/* Cria blips/labels ao iniciar servidor */
INDUSTRIES.forEach(spawnBlipAndLabel);
