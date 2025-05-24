interface HudData {
  line1: string;
  line2: string;
}

let hud: HudData | null = null;

/* eventos do servidor */
mp.events.add('trucking:hud', (l1: string, l2: string) => {
  hud = { line1: l1, line2: l2 };
});
mp.events.add('trucking:hud:clear', () => (hud = null));

/* desenha a cada frame */
mp.events.add('render', () => {
  if (!hud) return;

  const { line1, line2 } = hud;

  const opts: any = { font: 4, scale: [0.4, 0.4], outline: true };

  mp.game.graphics.drawText('~w~' + line1, [0.02, 0.80], opts);
  mp.game.graphics.drawText('~c~' + line2, [0.02, 0.83], opts);
});
