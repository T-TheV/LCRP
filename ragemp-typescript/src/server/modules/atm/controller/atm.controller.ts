/// <reference path="../../../@types/rage-mp/index.d.ts" />

// Controlador do ATM
export const handleATMInteraction = (player: PlayerMp) => {
    // Chamada básica para interação com o ATM
    player.call('atm:open', []);
};

mp.events.addCommand('atm', (player) => {
    player.outputChatBox('[Servidor] Aqui deveria abrir a interface do ATM.');
});