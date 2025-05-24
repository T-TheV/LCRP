// src/client/modules/eletricista/sfx.ts

let audioBrowser: BrowserMp | null = null;
let sparkTimer: number | null = null;

type SparkPoint = { x: number; y: number; z: number; r: number; index: number; volume: number };
let activeSparkPoints: SparkPoint[] = [];

mp.events.add("playerReady", () => {
  audioBrowser = mp.browsers.new("package://html/audio.html");
  mp.gui.chat.push("[SFX] audioBrowser criado");
});

mp.events.add("elec:setSparkZones", (pontos: { x: number; y: number; z: number; r: number }[]) => {
  activeSparkPoints = pontos.map((p, i) => ({
    ...p,
    index: i,
    volume: 0
  }));

  if (sparkTimer) clearInterval(sparkTimer);

  sparkTimer = setInterval(() => {
    const pos = mp.players.local.position;

    for (const point of activeSparkPoints) {
      const dist = mp.game.gameplay.getDistanceBetweenCoords(
        pos.x, pos.y, pos.z,
        point.x, point.y, point.z,
        true
      );

      let newVolume = 0;
      // if (dist <= 10 ) newVolume = 1.0;
      // else if (dist <= 20) newVolume = 0.8;
      // else if (dist <= 30) newVolume = 0.4;
      // else if (dist >= 30 && dist < 35) newVolume = 0.2;
      // else if (dist >= 35 && dist <= 40) newVolume = 0.1;
      // else if (dist > 40) newVolume = 0;
      // Considerando que o som começa a tocar dentro de 40 metros
      if (dist <= 40) {
        // Volume máximo a 0 metros, mínimo 0.1 a 40 metros
        let maxDist = 40;
        let minVolume = 0.1;
        let maxVolume = 1.0;

        // Fórmula linear decrescente
        newVolume = maxVolume - ((dist / maxDist) * (maxVolume - minVolume));
        newVolume = Math.max(minVolume, Math.min(maxVolume, newVolume));
      } else {
        newVolume = 0;
      }

      if (newVolume !== point.volume) {
        point.volume = newVolume;

        if (audioBrowser) {
          if (newVolume > 0) {
            audioBrowser.execute(`playSpark(${point.index});`);
            audioBrowser.execute(`setSparkVolume(${point.index}, ${newVolume});`);
          } else {
            audioBrowser.execute(`stopSpark(${point.index});`);
          }
        }
      }
    }
  }, 1000);
});

mp.events.add("elec:stopSparkSound", () => {
  if (audioBrowser) {
    audioBrowser.execute("stopAllSparks();");
  }

  activeSparkPoints = [];

  if (sparkTimer) {
    clearInterval(sparkTimer);
    sparkTimer = null;
  }

  mp.gui.chat.push("[SFX] 🔇 Todos os sons foram finalizados.");
});
