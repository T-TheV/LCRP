/// <reference path="../../@types/rage-mp/index.d.ts" />

export interface Item {
    id: number;
    name: string;
    description: string;
}

export const logItemAction = (player, action) => {
    player.outputChatBox(`[Servidor] Aqui deveria registrar a ação de item: ${action}.`);
};