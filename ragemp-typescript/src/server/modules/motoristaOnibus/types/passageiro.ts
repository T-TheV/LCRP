export interface PassageiroNPC {
    ped: PedMp;
    destinoIndex: number;
    entrouNoOnibus: boolean;
    desembarcou: boolean;
    pontoOrigem: number;
    disponivelParaEmbarque: boolean;
    sendoEmbarcado: boolean;
    seat?: number;
}