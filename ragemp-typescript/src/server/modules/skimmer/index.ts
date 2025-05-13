/// <reference path="../../@types/rage-mp/index.d.ts" />

mp.events.add('skimmer:install', (player) => {
    player.outputChatBox('[Servidor] Aqui deveria instalar um skimmer no ATM.');
});

mp.events.add('skimmer:remove', (player) => {
    player.outputChatBox('[Servidor] Aqui deveria remover um skimmer do ATM.');
});