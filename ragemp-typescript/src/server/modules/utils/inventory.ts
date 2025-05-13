/// <reference path="../../@types/rage-mp/index.d.ts" />

export const addItemToInventory = (player, item) => {
    player.outputChatBox(`[Servidor] Aqui deveria adicionar o item ${item.name} ao inventário.`);
};

export const removeItemFromInventory = (player, item) => {
    player.outputChatBox(`[Servidor] Aqui deveria remover o item ${item.name} do inventário.`);
};