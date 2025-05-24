/**
 * @function handleCoordsCommand
 * @description Mostra no chat as coordenadas do jogador no formato Vector3.
 * @param {PlayerMp} player - O jogador que executou o comando.
 */
export function handleCoordsCommand(player: PlayerMp): void {
    const pos = player.position;
    const precision = 2;

    const coordStringChat = `X: ${pos.x.toFixed(precision)}, Y: ${pos.y.toFixed(precision)}, Z: ${pos.z.toFixed(precision)}`;
    const coordStringVector = `new mp.Vector3(${pos.x.toFixed(precision)}, ${pos.y.toFixed(precision)}, ${pos.z.toFixed(precision)})`;

    // Mostra coordenadas normais
    player.outputChatBox(`!{#CCE5FF}Suas coordenadas: !{#66FF66}${coordStringChat}`);

    // Mostra coordenadas no formato Vector3
    player.outputChatBox(`!{#FFFF99}Coordenadas (Vector3): !{#FFD700}${coordStringVector}`);
}
