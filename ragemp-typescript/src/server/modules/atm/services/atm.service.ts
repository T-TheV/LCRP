/// <reference path="../../../@types/rage-mp/index.d.ts" />

// Serviço do ATM
export const depositMoney = (player, amount) => {
    player.outputChatBox(`[Servidor] Aqui deveria adicionar ${amount} ao saldo bancário.`);
};

export const withdrawMoney = (player, amount) => {
    player.outputChatBox(`[Servidor] Aqui deveria remover ${amount} do saldo bancário.`);
};