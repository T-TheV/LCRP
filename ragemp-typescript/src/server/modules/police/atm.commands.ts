/// <reference path="../../@types/rage-mp/index.d.ts" />

mp.events.addCommand('escanearatm', (player) => {
    player.outputChatBox('[Servidor] Aqui deveria escanear o ATM para skimmers.');
});

mp.events.addCommand('removerskimmer', (player) => {
    player.outputChatBox('[Servidor] Aqui deveria remover o skimmer do ATM.');
});