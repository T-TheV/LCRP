// server/xmradio/events/xmradio.events.ts

const DEFAULT_RADIO_VOLUME = 0.5;

/**
 * Função para obter todos os ocupantes de um veículo.
 * @param vehicle O veículo do qual obter os ocupantes.
 * @returns Uma lista de jogadores ocupando o veículo.
 */
export function getAllOccupants(vehicle: VehicleMp): PlayerMp[] {
    const occupantsList: PlayerMp[] = [];
    const driver = vehicle.getOccupant(0); // Seat 0 é geralmente o motorista
    if (driver) {
        occupantsList.push(driver);
    }

    const passengers = vehicle.getOccupants();
    if (passengers && passengers.length > 0) {
        occupantsList.push(...passengers);
    }
    return occupantsList;
}

mp.events.add('server:xmradio:requestStateChange', (player: PlayerMp, url: string | null, name: string | null, isPlaying: boolean, volume: number) => {
    if (!player.vehicle) {
        console.warn(`[XMSRV] requestStateChange: Player ${player.name} não está em um veículo.`);
        return;
    }
    if (player.vehicle.getVariable('hasXMRadio') !== true) {
        console.warn(`[XMSRV] requestStateChange: Veículo ${player.vehicle.id} não tem XM Radio.`);
        return;
    }

    const sanitizedVolume = (typeof volume === 'number' && !isNaN(volume)) ? Math.max(0, Math.min(1, volume)) : DEFAULT_RADIO_VOLUME;

    player.vehicle.setVariable('xmRadio_url', url);
    player.vehicle.setVariable('xmRadio_name', name);
    player.vehicle.setVariable('xmRadio_isPlaying', isPlaying);
    player.vehicle.setVariable('xmRadio_volume', sanitizedVolume);
    player.vehicle.setVariable('xmRadio_djId', player.id);

    if (isPlaying) {
        console.log(`[XMSRV] Veículo ${player.vehicle.id} (DJ: ${player.name}) agora tocando: ${name} | URL: ${url} | Vol: ${sanitizedVolume}`);
    } else {
        console.log(`[XMSRV] Veículo ${player.vehicle.id} (DJ: ${player.name}) rádio parada.`);
    }

    setTimeout(() => {
        const currentVehicle = player.vehicle;
        // Verifica se o veículo ainda existe e é uma entidade válida
        if (currentVehicle && mp.vehicles.exists(currentVehicle)) {
            const occupants = getAllOccupants(currentVehicle);
            occupants.forEach((occupant: PlayerMp) => {
                if (occupant.id !== player.id) {
                    occupant.call('client:xmradio:syncStation', [url, name, isPlaying, sanitizedVolume]);
                }
            });
        } else {
            console.warn(`[XMSRV] requestStateChange: Veículo não existe mais ao tentar notificar ocupantes.`);
        }
    }, 50);
});

mp.events.add('server:xmradio:requestVolumeChange', (player: PlayerMp, volume: number) => {
    if (!player.vehicle) {
        console.warn(`[XMSRV] requestVolumeChange: Player ${player.name} não está em um veículo.`);
        return;
    }
    if (player.vehicle.getVariable('hasXMRadio') !== true) {
        console.warn(`[XMSRV] requestVolumeChange: Veículo ${player.vehicle.id} não tem XM Radio.`);
        return;
    }

    const sanitizedVolume = (typeof volume === 'number' && !isNaN(volume)) ? Math.max(0, Math.min(1, volume)) : DEFAULT_RADIO_VOLUME;
    player.vehicle.setVariable('xmRadio_volume', sanitizedVolume);
    console.log(`[XMSRV] Veículo ${player.vehicle.id} (DJ: ${player.name}) volume alterado para: ${sanitizedVolume}`);

    const url = player.vehicle.getVariable('xmRadio_url');
    const name = player.vehicle.getVariable('xmRadio_name');
    const isPlaying = player.vehicle.getVariable('xmRadio_isPlaying');

    setTimeout(() => {
        const currentVehicle = player.vehicle;
        if (currentVehicle && mp.vehicles.exists(currentVehicle)) {
            const occupants = getAllOccupants(currentVehicle);
            occupants.forEach((occupant: PlayerMp) => {
                if (occupant.id !== player.id) {
                    occupant.call('client:xmradio:syncStation', [url, name, isPlaying, sanitizedVolume]);
                }
            });
        } else {
            console.warn(`[XMSRV] requestVolumeChange: Veículo não existe mais ao tentar notificar ocupantes.`);
        }
    }, 50);
});

mp.events.add("playerEnterVehicle", (player: PlayerMp, vehicle: VehicleMp, _seat: number) => {
    if (vehicle.getVariable('hasXMRadio') === true) {
        player.call('client:xmradio:vehicleHasRadio', [true]);
        player.outputChatBox("!{#00FFFF}INFO: !{#FFFFFF}Este veículo possui XM Radio. Use !{#00FF00}/xmradio !{#FFFFFF}para abrir a interface.");

        const url = vehicle.getVariable('xmRadio_url') as string | null;
        const name = vehicle.getVariable('xmRadio_name') as string | null;
        const isPlaying = vehicle.getVariable('xmRadio_isPlaying') as boolean | undefined;
        const volume = vehicle.getVariable('xmRadio_volume') as number | undefined;
        const currentDjId = vehicle.getVariable('xmRadio_djId') as number | undefined;

        if (isPlaying === true && url && name) {
            const syncVolume = (typeof volume === 'number' && !isNaN(volume)) ? volume : DEFAULT_RADIO_VOLUME;
            console.log(`[XMSRV] Player ${player.name} entrou no veículo ${vehicle.id} com rádio tocando: ${name} (DJ ID: ${currentDjId}) Vol: ${syncVolume}`);
            player.call('client:xmradio:syncStation', [url, name, true, syncVolume]);
        } else {
             console.log(`[XMSRV] Player ${player.name} entrou no veículo ${vehicle.id}. Rádio não está (ou nunca esteve) tocando.`);
        }
    } else {
        player.call('client:xmradio:vehicleHasRadio', [false]);
    }
});

mp.events.add("playerLeaveVehicle", (player: PlayerMp, _vehicle: VehicleMp) => {
    player.call('client:xmradio:leftVehicle');
    console.log(`[XMSRV] Player ${player.name} saiu do veículo ${_vehicle?.id || 'desconhecido'}.`); // Adicionado _vehicle?.id para segurança
});

mp.events.addCommand('xmradio', (player: PlayerMp) => {
    if (!player.vehicle) {
        return player.outputChatBox("!{#FF0000}ERRO: !{#FFFFFF}Você precisa estar em um veículo para usar o XM Radio.");
    }
    if (player.vehicle.getVariable('hasXMRadio') !== true) {
        return player.outputChatBox("!{#FF8C00}AVISO: !{#FFFFFF}Este veículo não possui XM Radio instalado.");
    }
    player.call('client:xmradio:toggleUI');
});

mp.events.add("playerExitVehicle", (_player: PlayerMp, _vehicle: VehicleMp) => {
    // ... (lógica opcional comentada como antes) ...
});

console.log('[SERVER] Módulo de Eventos XM Radio (com sincronização) carregado e corrigido (v2).');