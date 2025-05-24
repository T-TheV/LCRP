// client/xmradio/index.ts

// --- Instâncias dos Browsers ---
let mainUiBrowser: BrowserMp | null = null;
let audioHandlerBrowser: BrowserMp | null = null;
let miniPlayerBrowser: BrowserMp | null = null;

// --- Flags de Estado de Prontidão dos Browsers ---
let mainUiReady = false;
let audioHandlerReady = false;
let miniPlayerReady = false;

// --- Estado Geral do Rádio ---
let vehicleHasRadio = false; // Se o veículo atual do jogador tem o item XM Radio (quando DENTRO dele)
let isRadioFeatureGloballyOn = false; // Se o jogador ligou a "feature" do rádio (intenção de ouvir)
let currentRadioUrl: string | null = null;
let currentRadioName: string | null = null;
let currentVolume = 0.5; // Volume base ou atual do áudio player
let mainUiIsVisible = false; // Para controlar o estado visual da UI principal

// --- Estado para Áudio Ambiente ---
let ambientSourceVehicleRemoteId: number | null = null; // RemoteID do veículo que estamos ouvindo DE FORA
let ambientVolumeInterval: number | null = null;   // CORRIGIDO: NodeJS.Timeout -> number
let ambientScanInterval: number | null = null;     // CORRIGIDO: NodeJS.Timeout -> number

const DEFAULT_RADIO_VOLUME = 0.5;
const MAX_AUDIBLE_DISTANCE = 45.0; // Unidades do jogo
const MIN_AUDIBLE_DISTANCE_FULL_VOLUME = 5.0; // Distância para volume máximo
const AMBIENT_SCAN_RATE_MS = 2000; // Escaneia por rádios próximas a cada 2 segundos
const AMBIENT_VOLUME_UPDATE_RATE_MS = 250; // Atualiza volume da rádio ambiente 4x por segundo

const PREDEFINED_RADIOS = [
    { name: "Rádio Pan Elétrica", url: "https://livesfy.livester.com.br/radios/paneeletrica.mp3" },
    { name: "Rádio Zeno FM", url: "https://stream.zeno.fm/de1h2ffyy68uv" },
    { name: "Rádio UPX", url: "https://sc1s.cdn.upx.com:8130/stream" },
];

// --- Funções de Gerenciamento de Browsers ---
function createAudioHandlerBrowser() {
    if (!audioHandlerBrowser) {
        console.log('[XMCLIENT] Criando Audio Handler Browser...');
        audioHandlerBrowser = mp.browsers.new('package://xmradio/audio_handler.html');
        audioHandlerReady = false;
    }
}

function createMiniPlayerBrowser() {
    if (!miniPlayerBrowser) {
        console.log('[XMCLIENT] Criando Mini Player Browser...');
        miniPlayerBrowser = mp.browsers.new('package://xmradio/miniplayer.html');
        miniPlayerReady = false;
    }
}

function createMainUiBrowser() {
    if (!mainUiBrowser) {
        console.log('[XMCLIENT] Criando Main UI Browser...');
        mainUiBrowser = mp.browsers.new('package://xmradio/xmradio.html');
        mp.gui.cursor.show(true, true);
        mainUiIsVisible = true;
        mainUiReady = false;
    } else {
        mainUiBrowser.execute(`showUI();`); // Função JS dentro do xmradio.html
        mp.gui.cursor.show(true, true);
        mainUiIsVisible = true;
    }
}

function destroyMainUiBrowser() {
    if (mainUiBrowser) {
        console.log('[XMCLIENT] Destruindo Main UI Browser...');
        mainUiBrowser.destroy();
        mainUiBrowser = null;
        mainUiReady = false;
        mainUiIsVisible = false;
        if (mp.gui.cursor.visible) {
             mp.gui.cursor.show(false, false);
        }
    }
}

function hideMainUiBrowser() {
    if (mainUiBrowser && mainUiIsVisible) {
        console.log('[XMCLIENT] Escondendo Main UI Browser...');
        mainUiBrowser.execute(`hideUI();`); // Função JS dentro do xmradio.html
        mainUiIsVisible = false;
        if (mp.gui.cursor.visible) {
            mp.gui.cursor.show(false, false);
        }
    }
}

// --- Funções de Controle do Rádio ---

function startOrUpdateRadioPlayback(url: string, name: string, volumeForPlayback: number, fromSyncOrAmbient: boolean = false) {
    console.log(`[XMCLIENT] startOrUpdateRadioPlayback: URL=${url}, Name=${name}, Vol=${volumeForPlayback}, FromSyncOrAmbient=${fromSyncOrAmbient}`);
    createAudioHandlerBrowser();

    currentRadioUrl = url;
    currentRadioName = name;
    // currentVolume é o volume efetivo do player. volumeForPlayback é o volume base/DJ.
    // Se não for ambiente, currentVolume e volumeForPlayback podem ser o mesmo.
    // Se for ambiente, currentVolume será recalculado pela distância.
    if (!ambientSourceVehicleRemoteId || !fromSyncOrAmbient) { // Se não for ambient OU for play direto do DJ
        currentVolume = volumeForPlayback;
    }
    isRadioFeatureGloballyOn = true;

    if (audioHandlerReady && audioHandlerBrowser) {
        audioHandlerBrowser.execute(`playStream('${currentRadioUrl}', ${currentVolume});`);
    } else {
        console.warn('[XMCLIENT] Audio Handler não pronto, play será tentado no evento ready.');
        setTimeout(() => {
            if(audioHandlerReady && audioHandlerBrowser && currentRadioUrl === url) {
                 audioHandlerBrowser.execute(`playStream('${currentRadioUrl}', ${currentVolume});`);
            }
        }, 500);
    }

    createMiniPlayerBrowser();
    if (miniPlayerReady && miniPlayerBrowser) {
        miniPlayerBrowser.execute(`updateRadioInfo('${currentRadioName}');`);
        miniPlayerBrowser.execute(`toggleVisibility(true);`);
    } else {
        console.warn('[XMCLIENT] Mini Player não pronto, update será tentado no evento ready.');
         setTimeout(() => {
            if(miniPlayerReady && miniPlayerBrowser && currentRadioName === name) { // Verifica se o nome ainda é o esperado
                 miniPlayerBrowser.execute(`updateRadioInfo('${currentRadioName}');`);
                 miniPlayerBrowser.execute(`toggleVisibility(true);`);
            }
        }, 500);
    }

    if (mainUiBrowser && mainUiReady && mainUiIsVisible) {
        mainUiBrowser.execute(`setPlaybackState(true, '${currentRadioName}', '${currentRadioUrl}');`);
        mainUiBrowser.execute(`setVolumeSlider(${currentVolume});`);
    }

    if (!fromSyncOrAmbient && mp.players.local.vehicle && vehicleHasRadio) {
        mp.events.callRemote('server:xmradio:requestStateChange', currentRadioUrl, currentRadioName, true, currentVolume);
    }
}

function stopRadioPlayback(fromSyncOrAmbient: boolean = false, notifyServerIfDjAction: boolean = true) {
    console.log(`[XMCLIENT] stopRadioPlayback: FromSyncOrAmbient=${fromSyncOrAmbient}, NotifyServerIfDjAction=${notifyServerIfDjAction}`);
    
    if (audioHandlerReady && audioHandlerBrowser) {
        audioHandlerBrowser.execute(`stopStream();`);
    }
    if (miniPlayerReady && miniPlayerBrowser) {
        miniPlayerBrowser.execute(`toggleVisibility(false);`);
    }

    if (ambientVolumeInterval) { // Limpa o intervalo de volume ambiente se estiver ativo
        clearInterval(ambientVolumeInterval);
        ambientVolumeInterval = null;
    }
    // Não limpa ambientScanInterval aqui, ele é gerenciado separadamente (ex: ao entrar/sair de veículo, ou fullStop)
    
    // Limpa o veículo ambiente monitorado apenas se a parada não for por mudança de alvo no scan
    // Se for um full stop (notifyServerIfDjAction=true), ou se veio de sync e não está mais tocando
    if (notifyServerIfDjAction || (fromSyncOrAmbient && !isRadioFeatureGloballyOn)) {
        ambientSourceVehicleRemoteId = null;
    }


    if (notifyServerIfDjAction) {
        isRadioFeatureGloballyOn = false;
        currentRadioUrl = null;
        currentRadioName = null;
    }

    if (mainUiBrowser && mainUiReady && mainUiIsVisible) {
        mainUiBrowser.execute(`setPlaybackState(false, null, null);`);
    }

    if (notifyServerIfDjAction && !fromSyncOrAmbient && mp.players.local.vehicle && vehicleHasRadio) {
        mp.events.callRemote('server:xmradio:requestStateChange', null, null, false, currentVolume);
    }
}

// --- Lógica de Áudio Ambiente ---
function updateAmbientVolumeLogic() {
    if (ambientSourceVehicleRemoteId === null || !isRadioFeatureGloballyOn || mp.players.local.vehicle) {
        if (ambientVolumeInterval) clearInterval(ambientVolumeInterval);
        ambientVolumeInterval = null;
        if (ambientSourceVehicleRemoteId && !mp.players.local.vehicle) {
            console.log(`[XMCLIENT-Ambient] Condições para updateAmbientVolumeLogic não atendidas (source: ${ambientSourceVehicleRemoteId}). Parando stream localmente.`);
            if (audioHandlerBrowser && audioHandlerReady) audioHandlerBrowser.execute(`stopStream();`);
            if (miniPlayerBrowser && miniPlayerReady) miniPlayerBrowser.execute(`toggleVisibility(false);`);
            // Não reseta currentRadioUrl/Name aqui, pois o scan pode pegar outro veículo
        }
        // Não limpa ambientSourceVehicleRemoteId aqui, o scanForAmbientRadios é quem decide se troca ou limpa.
        return;
    }

    const vehicle = mp.vehicles.atRemoteId(ambientSourceVehicleRemoteId);

    if (!vehicle || !mp.vehicles.exists(vehicle)) {
        console.log(`[XMCLIENT-Ambient] Veículo ambiente (ID: ${ambientSourceVehicleRemoteId}) não encontrado/válido. Parando monitoramento.`);
        if (audioHandlerBrowser && audioHandlerReady) audioHandlerBrowser.execute(`stopStream();`);
        if (miniPlayerBrowser && miniPlayerReady) miniPlayerBrowser.execute(`toggleVisibility(false);`);
        currentRadioUrl = null; currentRadioName = null;
        ambientSourceVehicleRemoteId = null; // Limpa pois o veículo sumiu
        if (ambientVolumeInterval) clearInterval(ambientVolumeInterval);
        ambientVolumeInterval = null;
        return;
    }

    const vehicleRadioIsPlaying = vehicle.getVariable('xmRadio_isPlaying') as boolean;
    const vehicleRadioUrl = vehicle.getVariable('xmRadio_url') as string | null;

    if (!vehicleRadioIsPlaying || !vehicleRadioUrl) {
        console.log(`[XMCLIENT-Ambient] Rádio do veículo (ID: ${ambientSourceVehicleRemoteId}) foi desligado pelo servidor. Parando monitoramento.`);
        if (audioHandlerBrowser && audioHandlerReady) audioHandlerBrowser.execute(`stopStream();`);
        if (miniPlayerBrowser && miniPlayerReady) miniPlayerBrowser.execute(`toggleVisibility(false);`);
        currentRadioUrl = null; currentRadioName = null;
        ambientSourceVehicleRemoteId = null; // Limpa pois o rádio do veículo parou
        if (ambientVolumeInterval) clearInterval(ambientVolumeInterval);
        ambientVolumeInterval = null;
        return;
    }
    
    if (currentRadioUrl !== vehicleRadioUrl && vehicleRadioUrl) {
        console.log(`[XMCLIENT-Ambient] Stream do veículo ${ambientSourceVehicleRemoteId} mudou para ${vehicleRadioUrl}`);
        currentRadioUrl = vehicleRadioUrl;
        currentRadioName = vehicle.getVariable('xmRadio_name') as string | null || "Rádio";
        // O volume base será pego abaixo, currentVolume será ajustado pela distância
        const baseVolumeFromVehicleAmbient = vehicle.getVariable('xmRadio_volume') as number || DEFAULT_RADIO_VOLUME;
        if (audioHandlerReady && audioHandlerBrowser) {
            audioHandlerBrowser.execute(`playStream('${currentRadioUrl}', ${baseVolumeFromVehicleAmbient});`); // Toca com volume base, será ajustado
        }
        if (miniPlayerReady && miniPlayerBrowser && currentRadioName) {
            miniPlayerBrowser.execute(`updateRadioInfo('${currentRadioName}');`);
            miniPlayerBrowser.execute(`toggleVisibility(true);`);
        }
    }

    const playerPos = mp.players.local.position;
    const vehiclePos = vehicle.position;
    const distance = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z, vehiclePos.x, vehiclePos.y, vehiclePos.z);
    const baseVolumeFromVehicle = vehicle.getVariable('xmRadio_volume') as number || DEFAULT_RADIO_VOLUME;
    let targetVolume = 0;

    if (distance <= MIN_AUDIBLE_DISTANCE_FULL_VOLUME) {
        targetVolume = baseVolumeFromVehicle;
    } else if (distance <= MAX_AUDIBLE_DISTANCE) {
        const fadeFactor = 1 - ((distance - MIN_AUDIBLE_DISTANCE_FULL_VOLUME) / (MAX_AUDIBLE_DISTANCE - MIN_AUDIBLE_DISTANCE_FULL_VOLUME));
        targetVolume = baseVolumeFromVehicle * Math.max(0, fadeFactor); // Garante que fadeFactor não seja negativo
    }
    targetVolume = Math.max(0, Math.min(baseVolumeFromVehicle, targetVolume));

    if (Math.abs(currentVolume - targetVolume) > 0.01 || (targetVolume === 0 && currentVolume !== 0) || (targetVolume > 0 && currentVolume === 0 && isRadioFeatureGloballyOn && currentRadioUrl === vehicleRadioUrl)) {
        currentVolume = targetVolume; // currentVolume agora reflete o volume com base na distância
        if (audioHandlerReady && audioHandlerBrowser) {
            audioHandlerBrowser.execute(`setStreamVolume(${currentVolume});`);
             // Se o volume era zero e agora é maior, e estávamos na mesma rádio, poderia re-emitir playStream
             // mas setStreamVolume deve ser suficiente se o player não parou completamente.
        }
    }
}

function scanForAmbientRadios() {
    if (mp.players.local.vehicle) { 
        if (ambientScanInterval) clearInterval(ambientScanInterval);
        ambientScanInterval = null;
        if (ambientSourceVehicleRemoteId) {
            console.log(`[XMCLIENT-Ambient] Jogador em veículo. Parando rádio ambiente de ID: ${ambientSourceVehicleRemoteId}`);
            // stopRadioPlayback já lida com a limpeza de ambientVolumeInterval e ambientSourceVehicleRemoteId se chamado corretamente
            stopRadioPlayback(true, false); // fromSyncOrAmbient=true (comportamento similar), notifyServerIfDjAction=false
        }
        return;
    }

    let closestVehicle: VehicleMp | undefined;
    let minDistance = MAX_AUDIBLE_DISTANCE + 1.01; // Um pouco acima para garantir a comparação correta

    mp.vehicles.forEachInStreamRange((v: VehicleMp) => {
        if (v.getVariable('xmRadio_isPlaying') === true) {
            const distance = mp.players.local.dist(v.position);
            if (distance < minDistance) { // Encontra o mais próximo
                minDistance = distance;
                closestVehicle = v;
            }
        }
    });

    // --- Early Exit se nenhum veículo qualificado for encontrado ---
    if (!closestVehicle || minDistance > MAX_AUDIBLE_DISTANCE) {
        if (ambientSourceVehicleRemoteId !== null) { // Se estava monitorando algum veículo antes
            console.log(`[XMCLIENT-Ambient] Nenhum veículo com rádio audível encontrado. Parando monitoramento anterior (ID: ${ambientSourceVehicleRemoteId}).`);
            // stopRadioPlayback irá limpar ambientSourceVehicleRemoteId, currentRadioUrl, etc. e parar o som.
            stopRadioPlayback(true, false); // fromSyncOrAmbient=true, notifyServerIfDjAction=false
        }
        // Se não estava monitorando nada e não encontrou nada, não faz nada.
        return; // Sai da função se nenhum veículo audível foi encontrado
    }

    // --- Se chegamos aqui, closestVehicle é um VehicleMp válido e está no alcance ---
    // TypeScript agora deve ter certeza que closestVehicle não é null.

    if (closestVehicle && ambientSourceVehicleRemoteId !== closestVehicle.remoteId) { // Sem erro esperado aqui
        console.log(`[XMCLIENT-Ambient] Nova fonte de rádio ambiente encontrada ou mudança de fonte: ID ${closestVehicle.remoteId}, Dist: ${minDistance.toFixed(2)}`);
        
        if (ambientVolumeInterval) clearInterval(ambientVolumeInterval); // Para o loop de volume do veículo anterior
        
        ambientSourceVehicleRemoteId = closestVehicle.remoteId; // Sem erro esperado aqui
        const url = closestVehicle.getVariable('xmRadio_url') as string; // Sem erro esperado aqui
        const name = closestVehicle.getVariable('xmRadio_name') as string || "Rádio"; // Sem erro esperado aqui
        const baseVolume = closestVehicle.getVariable('xmRadio_volume') as number || DEFAULT_RADIO_VOLUME; // Sem erro esperado aqui

        // Inicia a reprodução para o novo veículo. O volume será ajustado por updateAmbientVolumeLogic.
        startOrUpdateRadioPlayback(url, name, baseVolume, true); // fromSyncOrAmbient = true
        
        // (Re)inicia o loop de atualização de volume para este novo veículo
        ambientVolumeInterval = setInterval(updateAmbientVolumeLogic, AMBIENT_VOLUME_UPDATE_RATE_MS);
        updateAmbientVolumeLogic(); // Chama uma vez imediatamente para setar o volume inicial correto
    }
    // Se for o mesmo veículo que já estava sendo monitorado, o updateAmbientVolumeLogic (que já está rodando) continua cuidando dele.
}

// --- Manipuladores de Eventos do RAGE MP ---

mp.events.add('client:xmradio:vehicleHasRadio', (hasRadio: boolean) => {
    console.log(`[XMCLIENT] vehicleHasRadio (para veículo atual do jogador): ${hasRadio}`);
    vehicleHasRadio = hasRadio;
    if (!hasRadio && isRadioFeatureGloballyOn && !ambientSourceVehicleRemoteId && mp.players.local.vehicle) {
        // Só para se estiver DENTRO de um carro sem rádio, e não ouvindo ambiente.
        console.log('[XMCLIENT] Entrou em carro sem rádio ou rádio foi removido. Parando rádio de ocupante.');
        stopRadioPlayback(false, true);
        if (mainUiIsVisible) destroyMainUiBrowser();
    }
});

mp.events.add('client:xmradio:leftVehicle', (_player: PlayerMp, _vehicleRemoteId: number) => {
    // _player e _vehicleRemoteId são do servidor, mas não usados diretamente aqui na nova lógica
    console.log(`[XMCLIENT] leftVehicle. (Re)Iniciando scan ambiente.`);
    vehicleHasRadio = false; 

    if (mainUiIsVisible) {
        hideMainUiBrowser();
    }
    
    if (!ambientScanInterval) {
        ambientScanInterval = setInterval(scanForAmbientRadios, AMBIENT_SCAN_RATE_MS);
    }
    scanForAmbientRadios(); // Força um scan imediato
});

// CORRIGIDO: Assinatura do evento e parâmetros não usados
mp.events.add("playerEnterVehicle", (_vehicle: VehicleMp, _seat: number) => { // _vehicle e _seat são do RAGE, não usamos diretamente aqui
    console.log('[XMCLIENT] playerEnterVehicle - Parando scans e rádios ambientes se ativos.');
    if (ambientScanInterval) {
        clearInterval(ambientScanInterval);
        ambientScanInterval = null;
    }
    if (ambientVolumeInterval) {
        clearInterval(ambientVolumeInterval);
        ambientVolumeInterval = null;
    }
    if (ambientSourceVehicleRemoteId !== null) { 
        console.log(`[XMCLIENT] Parando rádio ambiente (ID: ${ambientSourceVehicleRemoteId}) ao entrar em novo veículo.`);
        if (audioHandlerBrowser && audioHandlerReady) audioHandlerBrowser.execute('stopStream();');
        if (miniPlayerBrowser && miniPlayerReady) miniPlayerBrowser.execute('toggleVisibility(false);');
        currentRadioUrl = null; currentRadioName = null;
        // Não resetar isRadioFeatureGloballyOn aqui, pois o sync do novo veículo pode ativá-lo.
    }
    ambientSourceVehicleRemoteId = null;
    // O servidor agora envia 'client:xmradio:vehicleHasRadio' e depois 'client:xmradio:syncStation'
});

mp.events.add('client:xmradio:toggleUI', () => {
    console.log('[XMCLIENT] toggleUI command received');
    if (!vehicleHasRadio && mp.players.local.vehicle) { 
        mp.gui.chat.push("!{#FF8C00}AVISO: !{#FFFFFF}Este veículo não possui XM Radio instalado.");
        return;
    }
    if (!mp.players.local.vehicle && !isRadioFeatureGloballyOn) {
        mp.gui.chat.push("!{#FF8C00}AVISO: !{#FFFFFF}Entre em um veículo com XM Radio ou ative o rádio.");
        return;
    }
     if (!mp.players.local.vehicle && isRadioFeatureGloballyOn && ambientSourceVehicleRemoteId === null) {
        mp.gui.chat.push("!{#FF8C00}AVISO: !{#FFFFFF}Nenhuma rádio ambiente próxima para controlar.");
        // Ou talvez abrir a UI para permitir que o jogador cole uma URL para ouvir a pé (funcionalidade futura)?
        return;
    }


    if (mainUiIsVisible) {
        hideMainUiBrowser();
        if (isRadioFeatureGloballyOn && miniPlayerReady && miniPlayerBrowser) {
            miniPlayerBrowser.execute(`updateRadioInfo('${currentRadioName || "Rádio"}');`);
            miniPlayerBrowser.execute(`toggleVisibility(true);`);
        }
    } else {
        createMainUiBrowser();
        if (isRadioFeatureGloballyOn && miniPlayerReady && miniPlayerBrowser) {
             miniPlayerBrowser.execute(`toggleVisibility(false);`);
        }
    }
});

mp.events.add('client:xmradio:syncStation', (url: string | null, name: string | null, isPlaying: boolean, volume: number) => {
    console.log(`[XMCLIENT] syncStation (para ocupante): URL=${url}, Name=${name}, Playing=${isPlaying}, Vol=${volume}`);
    if (mp.players.local.vehicle) { // Garante que este sync é para quando se é ocupante
        // Para qualquer áudio ambiente que estava tocando
        if (ambientScanInterval) clearInterval(ambientScanInterval); ambientScanInterval = null;
        if (ambientVolumeInterval) clearInterval(ambientVolumeInterval); ambientVolumeInterval = null;
        if (ambientSourceVehicleRemoteId) { 
            if(audioHandlerBrowser && audioHandlerReady) audioHandlerBrowser.execute('stopStream();'); // Para o som ambiente anterior
        }
        ambientSourceVehicleRemoteId = null; // Limpa o estado ambiente

        if (isPlaying && url && name) {
            startOrUpdateRadioPlayback(url, name, volume, true); 
        } else {
            stopRadioPlayback(true, false); 
        }
    } else {
        console.warn("[XMCLIENT] Recebeu syncStation (ocupante) mas não está em veículo. Ignorando.");
    }
});

mp.events.add('client:audio_handler:ready', () => {
    console.log('[XMCLIENT] Evento: Audio Handler está pronto.');
    audioHandlerReady = true;
    if (audioHandlerBrowser) {
        audioHandlerBrowser.execute(`setStreamVolume(${currentVolume});`);
        if (isRadioFeatureGloballyOn && currentRadioUrl) { 
            audioHandlerBrowser.execute(`playStream('${currentRadioUrl}', ${currentVolume});`);
        }
    }
});

mp.events.add('client:miniplayer:ready', () => {
    console.log('[XMCLIENT] Evento: Mini Player está pronto.');
    miniPlayerReady = true;
    if (miniPlayerBrowser) {
        if (isRadioFeatureGloballyOn && currentRadioName) {
            miniPlayerBrowser.execute(`updateRadioInfo('${currentRadioName}');`);
            miniPlayerBrowser.execute(`toggleVisibility(true);`);
        } else {
            miniPlayerBrowser.execute(`toggleVisibility(false);`);
        }
    }
});

mp.events.add('client:xmradio:mainUiReady', () => {
    console.log('[XMCLIENT] Evento: Main UI está pronta.');
    mainUiReady = true;
    if (mainUiBrowser) {
        mainUiBrowser.execute(`loadRadioList(${JSON.stringify(PREDEFINED_RADIOS)});`);
        
        const ambientVehicle: VehicleMp | null = ambientSourceVehicleRemoteId ? mp.vehicles.atRemoteId(ambientSourceVehicleRemoteId) ?? null : null;
        const displayVolume = ambientVehicle?.getVariable('xmRadio_volume') ?? currentVolume;
        
        mainUiBrowser.execute(`setVolumeSlider(${displayVolume});`);
        
        if (isRadioFeatureGloballyOn && currentRadioName && currentRadioUrl) {
            const displayName = ambientVehicle ? `${currentRadioName} (Ambiente)` : currentRadioName;
            mainUiBrowser.execute(`setPlaybackState(true, '${displayName}', '${currentRadioUrl}');`);
        } else {
            mainUiBrowser.execute(`setPlaybackState(false, null, null);`);
        }
    }
});


mp.events.add('client:xmradio:playStationRequested', (url: string, name: string) => {
    console.log(`[XMCLIENT] playStationRequested: URL=${url}, Name=${name}`);
    if (mp.players.local.vehicle && vehicleHasRadio) { // Só pode ser DJ se estiver num veículo com rádio
        if (ambientScanInterval) clearInterval(ambientScanInterval); ambientScanInterval = null;
        if (ambientVolumeInterval) clearInterval(ambientVolumeInterval); ambientVolumeInterval = null;
        ambientSourceVehicleRemoteId = null;

        startOrUpdateRadioPlayback(url, name, currentVolume, false); 
        hideMainUiBrowser();
    } else if (!mp.players.local.vehicle) {
        // Tocar rádio a pé, sem ser DJ de veículo? (Nova funcionalidade)
        // Por enquanto, isso significa que o player está tentando ser DJ sem veículo, o que não deveria acontecer.
        // Ou a UI principal foi aberta enquanto estava ouvindo ambiente.
        // Para tocar uma rádio "pessoal" a pé:
        ambientSourceVehicleRemoteId = null; // Garante que não é mais ambiente
        if (ambientVolumeInterval) clearInterval(ambientVolumeInterval); ambientVolumeInterval = null;
        startOrUpdateRadioPlayback(url, name, currentVolume, true); // fromSyncOrAmbient = true para não notificar servidor
        hideMainUiBrowser();
        mp.gui.chat.push(`Tocando rádio pessoal: ${name}`);
    }
});

mp.events.add('client:xmradio:mainUiClosed', () => {
    console.log('[XMCLIENT] mainUiClosed (via X ou ESC)');
    if (mp.gui.cursor.visible) {
        mp.gui.cursor.show(false, false);
    }
    mainUiIsVisible = false;
    if (isRadioFeatureGloballyOn && miniPlayerReady && miniPlayerBrowser) {
        miniPlayerBrowser.execute(`updateRadioInfo('${currentRadioName || (isRadioFeatureGloballyOn ? "Rádio" : "")}');`); 
        miniPlayerBrowser.execute(`toggleVisibility(true);`);
    }
});

mp.events.add('client:xmradio:volumeChanged', (newVolume: number) => {
    console.log(`[XMCLIENT] volumeChanged pela UI Principal: ${newVolume}`);
    // Este volume da UI principal é o volume que o DJ quer para o veículo, ou o volume pessoal se a pé.
    currentVolume = newVolume; 
    if (audioHandlerReady && audioHandlerBrowser) {
        audioHandlerBrowser.execute(`setStreamVolume(${currentVolume});`);
    }
    // Se for DJ de um veículo, notifica o servidor.
    if (mp.players.local.vehicle && vehicleHasRadio && isRadioFeatureGloballyOn && !ambientSourceVehicleRemoteId) { 
        mp.events.callRemote('server:xmradio:requestVolumeChange', currentVolume);
    }
});

mp.events.add('client:xmradio:requestFullStop', () => {
    console.log('[XMCLIENT] requestFullStop - Parando rádio global e todos os timers.');
    if (ambientScanInterval) { 
        clearInterval(ambientScanInterval);
        ambientScanInterval = null;
    }
    // stopRadioPlayback já limpa ambientVolumeInterval e ambientSourceVehicleRemoteId
    const wasInVehicleAsDj = mp.players.local.vehicle && vehicleHasRadio && !ambientSourceVehicleRemoteId && isRadioFeatureGloballyOn;
    stopRadioPlayback(false, wasInVehicleAsDj); // Notify server only if was DJ in vehicle
    
    if (mainUiBrowser && mainUiReady){
        mainUiBrowser.execute(`setPlaybackState(false, null, null);`);
    }
});

mp.events.add('client:xmradio:audioHandlerError', (errorMessage: string) => {
    console.error(`[XMCLIENT] AudioHandler Error: ${errorMessage}`);
    mp.gui.chat.push(`!{#FF3333}[Erro no Rádio] !{#FFFFFF}${errorMessage.substring(0, 100)}`);
    if (miniPlayerReady && miniPlayerBrowser) {
        miniPlayerBrowser.execute(`updateRadioInfo('Erro na Rádio');`);
    }
});

// --- Inicialização / Limpeza ---
mp.events.add('playerReady', () => { 
    console.log('[XMCLIENT] playerReady - Iniciando scan ambiente se estiver a pé.');
    createAudioHandlerBrowser(); // Cria o handler de áudio logo para estar pronto
    createMiniPlayerBrowser();   // Cria o miniplayer logo para estar pronto

    if (!mp.players.local.vehicle) {
        if (ambientScanInterval) clearInterval(ambientScanInterval); 
        ambientScanInterval = setInterval(scanForAmbientRadios, AMBIENT_SCAN_RATE_MS);
        scanForAmbientRadios(); 
    }
});

mp.events.add('playerQuit', () => {
    if (ambientScanInterval) clearInterval(ambientScanInterval);
    if (ambientVolumeInterval) clearInterval(ambientVolumeInterval);
    if (mainUiBrowser) mainUiBrowser.destroy();
    if (audioHandlerBrowser) audioHandlerBrowser.destroy();
    if (miniPlayerBrowser) miniPlayerBrowser.destroy();
    mainUiBrowser = audioHandlerBrowser = miniPlayerBrowser = null;
    mainUiReady = audioHandlerReady = miniPlayerReady = false;
    isRadioFeatureGloballyOn = vehicleHasRadio = mainUiIsVisible = false;
    currentRadioUrl = currentRadioName = ambientSourceVehicleRemoteId = null;
    currentVolume = DEFAULT_RADIO_VOLUME;
});

console.log('[CLIENT] Módulo XM Radio (v3.1 - Áudio Ambiente Corrigido) carregado.');