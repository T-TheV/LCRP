// src/server/utils/extendedPlayer.utils.ts
// ----------------------------------------
// Injeta giveMoney e dist nos objetos PlayerMp em runtime.

mp.players.forEach(registerExtensions);              // aplica nos já conectados
mp.events.add('playerJoin', registerExtensions);     // aplica nos que entrarem

function registerExtensions(player: PlayerMp) {
  // Distância Euclidiana até um ponto
  player.dist = function (pos: Vector3) {
    // @ts-ignore distanceTo não está tipado no d.ts padrão
    return (this.position as any).distanceTo(pos);
  };

  // Simples ajuste de dinheiro em memória (exemplo)
  player.giveMoney = function (amount: number) {
    // @ts-ignore money não tipado
    this.money = (this.money || 0) + amount;
    this.notify(
      `${amount >= 0 ? '💰 +$' : '💸 -$'}${Math.abs(amount)}`
    );
  };
}
