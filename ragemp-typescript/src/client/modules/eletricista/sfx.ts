// src/client/modules/eletricista/sfx.ts

let sparkTimer: number | null = null;
let activeSparkPoints: { x: number, y: number, z: number, r: number, playing: boolean }[] = [];

// Chave e grupo de som nativo do GTA V (personalizável)
const SOUND_NAME = "Spark"; // ex: "SPARK", "SPARKS", "ELECTRIC_CRACKLE"
const SOUND_SET = "RESIDENT"; // RESIDENT, DLC_WMSIRENS_SOUNDSET, etc.

mp.events.add("elec:setSparkZones", (pontos: { x: number, y: number, z: number, r: number }[]) => {
  activeSparkPoints = pontos.map(p => ({ ...p, playing: false }));

  if (sparkTimer) clearInterval(sparkTimer);
  
  sparkTimer = setInterval(() => {
    const playerPos = mp.players.local.position;

    for (const point of activeSparkPoints) {
      const dist = mp.game.gameplay.getDistanceBetweenCoords(
        playerPos.x, playerPos.y, playerPos.z,
        point.x, point.y, point.z,
        true
      );

      if (dist <= point.r && !point.playing) {
        point.playing = true;
        mp.gui.chat.push(`[SFX] 🔊 Som ligado em (${point.x.toFixed(0)}, ${point.y.toFixed(0)})`);
        mp.game.audio.playSoundFromCoord(
          -1, // soundId -1 = automático
          SOUND_NAME,
          point.x,
          point.y,
          point.z,
          SOUND_SET,
          false, // p6
          0,     // p7
          false  // p8
        );
      }

      if (dist > point.r && point.playing) {
        point.playing = false;
        mp.gui.chat.push(`[SFX] 🔇 Fora da área do som (${dist.toFixed(1)}m)`);
        // Não é possível parar som individualmente com playSoundFromCoord
        // Podemos usar AudioEntity custom futuramente
      }
    }
  }, 1000);
});

mp.events.add("elec:stopSparkSound", () => {
  activeSparkPoints = [];
  if (sparkTimer) {
    clearInterval(sparkTimer);
    sparkTimer = null;
  }
  mp.gui.chat.push("[SFX] Todos os sons finalizados.");
});
