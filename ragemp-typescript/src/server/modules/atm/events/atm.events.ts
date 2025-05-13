/// <reference path="../../../@types/rage-mp/index.d.ts" />

declare const mp: any;

// Eventos relacionados ao ATM
mp.events.add('atm:deposit', (player: PlayerMp, amount: number) => {
    player.outputChatBox(`[Servidor] Aqui deveria depositar ${amount} no banco.`);
});

mp.events.add('atm:withdraw', (player: PlayerMp, amount: number) => {
    player.outputChatBox(`[Servidor] Aqui deveria sacar ${amount} do banco.`);
});