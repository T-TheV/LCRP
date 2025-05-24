interface LabelInfo {
  text: string;
  pos: Vector3;
}

const clientLabels = new Map<number, LabelInfo>();
const DRAW_DIST = 30;

/* criação / remoção vindas do servidor */
mp.events.add('trucking:label', (id: number, txt: string, x: number, y: number, z: number) => {
  clientLabels.set(id, { text: txt, pos: new mp.Vector3(x, y, z) });
});
mp.events.add('trucking:label:remove', (id: number) => clientLabels.delete(id));

/* render loop */
mp.events.add('render', () => {
  const pPos = mp.players.local.position as Vector3;

  clientLabels.forEach(({ text, pos }) => {
    if ((pPos as any).distanceTo(pos) > DRAW_DIST) return;

    mp.game.graphics.drawText(
      text,
      [pos.x, pos.y, pos.z + 1.0] as [number, number, number],
      {
        font: 4,
        scale: [0.35, 0.35],          // ← tupla
        color: [255, 255, 255, 255],
        centre: true,
        outline: true,
      },
    );
  });
});
