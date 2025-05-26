export const pontoInicialMotorista = new mp.Vector3(425.05, -656.10, 28.58);

export type TipoPontoRota = 'inicio' | 'passageiro' | 'percurso' | 'fim';

export interface PontoDeRota {
  tipo: TipoPontoRota;
  pos: Vector3;
  pos_passageiro?: Vector3; // NOVO: posição onde o NPC será spawnado
}

export interface RotaOnibus {
  nome: string;
  pontos: PontoDeRota[];
}

export const rotasDeOnibus: RotaOnibus[] = [
  {
    nome: 'Centro da Cidade',
    pontos: [
      { tipo: 'inicio', pos: new mp.Vector3(402.77, -699.89, 29.19) },
      //{tipo: 'passageiro', pos: new mp.Vector3(402.12, -748.21, 29.19), pos_passageiro: new mp.Vector3(405.50, -747.10, 29.19)},
      { tipo: 'percurso', pos: new mp.Vector3(403.21, -785.25, 29.24) },
      {tipo: 'fim', pos: new mp.Vector3(480.76, -673.37, 26.16)}
    ]
  }
];
