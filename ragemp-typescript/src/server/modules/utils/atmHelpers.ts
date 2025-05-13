/// <reference path="../../@types/rage-mp/index.d.ts" />

export const calculateATMFees = (amount) => {
    mp.console.logInfo(`[Servidor] Aqui deveria calcular taxas para o valor: ${amount}.`);
    return amount * 0.05; // Exemplo de taxa de 5%
};