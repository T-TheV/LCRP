let hudBrowser: BrowserMp | null = null;
let currentBlip: BlipMp | null = null;
let cam: CameraMp | null = null;

// 🔁 Limpa blip atual do mapa
function clearCurrentBlip() {
  if (currentBlip && mp.blips.exists(currentBlip)) {
    currentBlip.destroy();
    currentBlip = null;
  }
}

// 📊 Atualiza a HUD
mp.events.add('motorista:atualizarHUD', (data: {
  avaliacao: number;
  embarcados: number;
  voltas: number;
  rota: string;
}) => {
  if (!hudBrowser) {
    hudBrowser = mp.browsers.new('package://html/hud.html');
  }

  setTimeout(() => {
    if (hudBrowser) {
      hudBrowser.execute(`typeof mp !== 'undefined' && mp.events.call('motorista:atualizarHUD', ${JSON.stringify(data)})`);
    }
  }, 100);
});

// 🧹 Fecha a HUD
mp.events.add('motorista:fecharHUD', () => {
  if (hudBrowser) {
    hudBrowser.destroy();
    hudBrowser = null;
  }
});

// 📍 Define waypoint com blip estilizado por tipo
mp.events.add('motorista:waypoint', (x: number, y: number, tipo: string) => {
  clearCurrentBlip();

  if (tipo === 'finalizacao') {
    mp.game.ui.setNewWaypoint(x, y);
    return;
  }

  let color = 5;
  let name = 'Próximo ponto';
  let icon = 1;

  if (tipo === 'inicio') {
    color = 5;
    icon = 164;
    name = 'Início da Rota';
  } else if (tipo === 'passageiro') {
    color = 3;
    icon = 280;
    name = 'Ponto de Passageiro';
  } else if (tipo === 'fim') {
    color = 1;
    icon = 38;
    name = 'Fim da Rota';
  }

  currentBlip = mp.blips.new(icon, new mp.Vector3(x, y, 0), {
    name,
    scale: 1.0,
    color,
    shortRange: false
  });

  currentBlip.setRoute(true);
  currentBlip.setRouteColour(color);
});

// 🧍 NPC entra no ônibus
mp.events.add('motorista:npcEntrar', (npcId: number, busId: number, seat: number) => {
    const npc = mp.peds.at(npcId);
    const bus = mp.vehicles.at(busId);

    if (!npc || !bus || !mp.peds.exists(npc) || !mp.vehicles.exists(bus)) return;

    // 🎥 Camera focando a entrada do ônibus
    const busPos = bus.position;
    const cam = mp.cameras.new('default', new mp.Vector3(
        busPos.x + 3,
        busPos.y + 2,
        busPos.z + 1
    ), new mp.Vector3(0, 0, 0), 40);

    cam.pointAtCoord(busPos.x, busPos.y, busPos.z + 1);
    cam.setActive(true);
    mp.game.cam.renderScriptCams(true, true, 1000, true, false);

    // 🚶 NPC anda até o ônibus e entra
    npc.taskEnterVehicle(bus.handle, 10000, seat, 2.0, 1, 0);

    // ⏲️ Verifica entrada após 3 segundos
    setTimeout(() => {
        if (!mp.peds.exists(npc) || !mp.vehicles.exists(bus)) return;

        // Força entrada se necessário
        npc.setIntoVehicle(bus.handle, seat);
        
        // Confirma entrada com servidor
        mp.events.callRemote('motorista:confirmarEntrada', npcId);

        // Destroi câmera
        cam.destroy();
        mp.game.cam.renderScriptCams(false, false, 0, true, false);
    }, 3000);
});

// 🧍 NPC sai do ônibus
mp.events.add('motorista:npcSair', (npcId: number, busId: number) => {
  const npc = mp.peds.at(npcId);
  const bus = mp.vehicles.at(busId);
  if (!npc || !bus || !mp.peds.exists(npc) || !mp.vehicles.exists(bus)) return;

  npc.taskLeaveVehicle(bus.handle, 0);

  setTimeout(() => {
    if (!mp.peds.exists(npc)) return;

    const forward = bus.getForwardVector();
    const targetPos = new mp.Vector3(
      npc.position.x + forward.x * 2,
      npc.position.y + forward.y * 2,
      npc.position.z
    );

    npc.taskGoStraightToCoord(targetPos.x, targetPos.y, targetPos.z, 1.0, 5000, 0, 0.0);

    setTimeout(() => {
      if (mp.peds.exists(npc)) {
        mp.events.callRemote('motorista:confirmarDesembarque', npcId);
      }
    }, 2500);
  }, 2000);
});

// ❄️ Congelamento do ônibus
setInterval(() => {
  const player = mp.players.local;
  const vehicle = player.vehicle;

  if (vehicle && vehicle.getVariable('motorista:congelado')) {
    vehicle.setUndriveable(true);
    vehicle.setForwardSpeed(0);
    vehicle.setBrakeLights(true);
  }
}, 200);

// 💬 Conversa animada
setInterval(() => {
  mp.peds.forEach((npc) => {
    if (npc.isInAnyVehicle(false)) {
      npc.taskPlayAnim('amb@world_human_cheering@male_a', 'base', 8.0, -8.0, -1, 1, 0, false, false, false);
    }
  });
}, 12000);
