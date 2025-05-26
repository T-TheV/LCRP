let hudBrowser: BrowserMp | null = null;
let currentBlip: BlipMp | null = null;

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

  const cam = mp.cameras.new('default', new mp.Vector3(npc.position.x, npc.position.y, npc.position.z + 2), new mp.Vector3(0, 0, 0), 40);
  cam.pointAtCoord(bus.position.x, bus.position.y, bus.position.z);
  cam.setActive(true);
  mp.game.cam.renderScriptCams(true, true, 1000, true, false);

  npc.taskEnterVehicle(bus.handle, 10000, seat, 2.0, 1, 0);

  setTimeout(() => {
    if (mp.peds.exists(npc) && mp.vehicles.exists(bus)) {
      const busPos = bus.getWorldPositionOfBone(bus.getBoneIndexByName('seat_pside_r'));
      npc.setCoordsNoOffset(busPos.x, busPos.y, busPos.z, false, false, false);
      npc.setIntoVehicle(bus.handle, seat);
      mp.events.callRemote('motorista:confirmarEntrada', npcId);
    }
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
    if (mp.peds.exists(npc) && mp.vehicles.exists(bus)) {
      mp.events.callRemote('motorista:confirmarDesembarque', npcId);
    }
  }, 2500);
});

// 💬 Simula barulho de conversa dentro do ônibus
setInterval(() => {
  mp.peds.forEach((npc) => {
    if (npc.isInAnyVehicle(false)) {
      npc.taskPlayAnim('amb@world_human_cheering@male_a', 'base', 8.0, -8.0, -1, 1, 0, false, false, false);
    }
  });
}, 12000);
