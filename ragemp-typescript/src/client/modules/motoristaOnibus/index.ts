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
    hudBrowser?.execute(`mp.events.call('motorista:atualizarHUD', ${JSON.stringify(data)})`);
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

  // 🛑 SE FOR FINALIZAÇÃO: só seta o waypoint, não cria blip
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

  npc.taskEnterVehicle(bus.handle, 10000, seat, 2.0, 1, 0);

  // Aguarda a task e confirma para o servidor
  setTimeout(() => {
    mp.events.callRemote('motorista:confirmarEntrada', npcId);
  }, 3500);
});

// 🧍 NPC sai do ônibus
mp.events.add('motorista:npcSair', (npcId: number, busId: number) => {
  const npc = mp.peds.at(npcId);
  const bus = mp.vehicles.at(busId);

  if (!npc || !bus || !mp.peds.exists(npc) || !mp.vehicles.exists(bus)) return;

  npc.taskLeaveVehicle(bus.handle, 0);

  // Aguarda o desembarque para confirmar
  setTimeout(() => {
    mp.events.callRemote('motorista:confirmarDesembarque', npcId);
  }, 2500);
});
