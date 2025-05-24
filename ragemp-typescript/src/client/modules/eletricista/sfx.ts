// src/client/modules/eletricista/sfx.ts

let audioBrowser: BrowserMp | null = null;
let sparkTimer: number | null = null;

type SparkPoint = { x: number; y: number; z: number; r: number; index: number; volume: number };
let activeSparkPoints: SparkPoint[] = [];

mp.events.add("playerReady", () => {
  audioBrowser = mp.browsers.new("package://html/audio.html");
  //mp.gui.chat.push("[SFX] audioBrowser criado");
});

mp.events.add("elec:setSparkZones", (pontos: { x: number; y: number; z: number; r: number }[]) => {
  activeSparkPoints = pontos.map((p, i) => ({
    ...p,
    index: i+1, // Adiciona o índice começando de 1
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
      if (dist <= 12.25) {
        // Volume máximo a 0 metros, mínimo 0.1 a 40 metros
        let maxDist = 12.25;
        let minVolume = 0.01;
        let maxVolume = 0.2;

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
  }, 100);
});

mp.events.add("elec:stopSparkSound", (indexToStop?: number) => {
  if (!audioBrowser) return;

  if (typeof indexToStop === "number") {
    // Assumimos que indexToStop é 1-based, vindo do seu comando /reparoeletrico
    audioBrowser.execute(`stopSpark(${indexToStop});`);
    //mp.gui.chat.push(`[SFX] 🔇 Som parado no ponto ${indexToStop}`);

    // Remove o ponto da lista activeSparkPoints para evitar que ele reinicie
    const pointArrayIndex = activeSparkPoints.findIndex(p => p.index === indexToStop);

    if (pointArrayIndex !== -1) {
      activeSparkPoints.splice(pointArrayIndex, 1);
      // Adicionando uma mensagem de debug para confirmar a remoção (opcional)
      // mp.gui.chat.push(`[SFX DEBUG] Ponto ${indexToStop} removido da lista ativa.`);
    } else {
      // Adicionando uma mensagem de debug se o ponto não for encontrado (opcional)
      // mp.gui.chat.push(`[SFX DEBUG] Ponto ${indexToStop} não encontrado na lista ativa para remoção.`);
    }

  } else { // Nenhum índice específico fornecido, parar todos os sons
    audioBrowser.execute("stopAllSparks();");
    //mp.gui.chat.push("[SFX] 🔇 Todos os sons foram finalizados.");
    activeSparkPoints = []; // Limpa todos os pontos

    if (sparkTimer) {
      clearInterval(sparkTimer);
      sparkTimer = null;
    }
  }

  // Se não houver mais pontos ativos, limpa o timer (caso ele ainda exista)
  if (activeSparkPoints.length === 0 && sparkTimer) {
    clearInterval(sparkTimer);
    sparkTimer = null;
    // mp.gui.chat.push("[SFX DEBUG] Nenhum ponto ativo restante, sparkTimer parado."); // Opcional
  }
});

// Lógica que tava funcionando, mas não era a ideal
// mp.events.add("elec:stopSparkSound", () => {
//   if (audioBrowser) {
//     audioBrowser.execute("stopAllSparks();");
//   }

//   activeSparkPoints = [];

//   if (sparkTimer) {
//     clearInterval(sparkTimer);
//     sparkTimer = null;
//   }

//   mp.gui.chat.push("[SFX] 🔇 Todos os sons foram finalizados.");
// });
