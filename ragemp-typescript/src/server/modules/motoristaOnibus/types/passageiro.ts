export interface PassageiroNPC {
  ped: PedMp;               // Referência ao NPC criado
  destinoIndex: number;     // Índice do ponto onde o passageiro deve descer
  entrouNoOnibus: boolean;  // Flag para saber se ele já entrou no ônibus
  desembarcou?: boolean;    // (opcional) Evita desembarques múltiplos
  seat?: number;            // Número do assento que o passageiro ocupou
}
