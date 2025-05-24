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
let vehicleHasRadio = false; // Se o veículo atual tem o item XM Radio
let isRadioFeatureGloballyOn = false; // Se o jogador ligou a "feature" do rádio (intenção de ouvir)
let currentRadioUrl: string | null = null;
let currentRadioName: string | null = null;
let currentVolume = 0.5; // Volume padrão inicial e compartilhado
let mainUiIsVisible = false; // Para controlar o estado visual da UI principal

const PREDEFINED_RADIOS = [
    { name: "Rádio Pan Elétrica", url: "https://livesfy.livester.com.br/radios/paneeletrica.mp3" },
    { name: "Rádio Zeno FM", url: "https://stream.zeno.fm/de1h2ffyy68uv" },
    { name: "Rádio UPX", url: "https://sc1s.cdn.upx.com:8130/stream" },
    // Adicione mais aqui
];

// --- Funções de Gerenciamento de Browsers ---

function createAudioHandlerBrowser() {
    if (!audioHandlerBrowser) {
        console.log('[XMCLIENT] Criando Audio Handler Browser...');
        audioHandlerBrowser = mp.browsers.new('package://xmradio/audio_handler.html');
        audioHandlerReady = false; // Aguardará o evento 'ready'
    }
}

function createMiniPlayerBrowser() {
    if (!miniPlayerBrowser) {
        console.log('[XMCLIENT] Criando Mini Player Browser...');
        miniPlayerBrowser = mp.browsers.new('package://xmradio/miniplayer.html');
        miniPlayerReady = false; // Aguardará o evento 'ready'
    }
}

function createMainUiBrowser() {
    if (!mainUiBrowser) {
        console.log('[XMCLIENT] Criando Main UI Browser...');
        mainUiBrowser = mp.browsers.new('package://xmradio/xmradio.html');
        mp.gui.cursor.show(true, true);
        mainUiIsVisible = true;
        mainUiReady = false; // Aguardará o evento 'ready'
    } else { // Se já existe, apenas mostra
        mainUiBrowser.execute(`showUI();`);
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
        if (mp.gui.cursor.visible) { // Só esconde o cursor se ele estiver visível por nossa causa
             mp.gui.cursor.show(false, false);
        }
    }
}

function hideMainUiBrowser() {
    if (mainUiBrowser && mainUiIsVisible) {
        console.log('[XMCLIENT] Escondendo Main UI Browser...');
        mainUiBrowser.execute(`hideUI();`);
        mainUiIsVisible = false;
        if (mp.gui.cursor.visible) {
            mp.gui.cursor.show(false, false);
        }
    }
}

// --- Funções de Controle do Rádio ---

function startOrUpdateRadioPlayback(url: string, name: string, volume: number, fromSync: boolean = false) {
    console.log(`[XMCLIENT] startOrUpdateRadioPlayback: URL=${url}, Name=${name}, Vol=${volume}, FromSync=${fromSync}`);
    createAudioHandlerBrowser(); // Garante que existe

    currentRadioUrl = url;
    currentRadioName = name;
    currentVolume = volume;
    isRadioFeatureGloballyOn = true;

    if (audioHandlerReady) {
        audioHandlerBrowser!.execute(`playStream('${currentRadioUrl}', ${currentVolume});`);
    } else {
        console.warn('[XMCLIENT] Audio Handler não pronto, play será tentado no evento ready.');
    }

    createMiniPlayerBrowser(); // Garante que existe
    if (miniPlayerReady) {
        miniPlayerBrowser!.execute(`updateRadioInfo('${currentRadioName}');`);
        miniPlayerBrowser!.execute(`toggleVisibility(true);`);
    } else {
        console.warn('[XMCLIENT] Mini Player não pronto, update será tentado no evento ready.');
    }

    // Atualiza a UI principal se estiver visível e pronta
    if (mainUiBrowser && mainUiReady && mainUiIsVisible) {
        mainUiBrowser.execute(`setPlaybackState(true, '${currentRadioName}', '${currentRadioUrl}');`);
    }

    // Se a ação não veio de uma sincronização (ou seja, o jogador local a iniciou)
    if (!fromSync && mp.players.local.vehicle && vehicleHasRadio) {
        mp.events.callRemote('server:xmradio:requestStateChange', currentRadioUrl, currentRadioName, true, currentVolume);
    }
}

function stopRadioPlayback(fromSync: boolean = false, notifyServer: boolean = true) {
    console.log(`[XMCLIENT] stopRadioPlayback: FromSync=${fromSync}, NotifyServer=${notifyServer}`);
    if (audioHandlerReady && audioHandlerBrowser) {
        audioHandlerBrowser.execute(`stopStream();`);
    }

    if (miniPlayerReady && miniPlayerBrowser) {
        miniPlayerBrowser.execute(`toggleVisibility(false);`);
    }

    // Se esta parada não for apenas uma pausa temporária, mas um desligamento da feature
    if (notifyServer) { // 'notifyServer' implica que é um full stop da feature
        isRadioFeatureGloballyOn = false;
        currentRadioUrl = null;
        currentRadioName = null;
    }


    // Atualiza a UI principal se estiver visível e pronta
    if (mainUiBrowser && mainUiReady && mainUiIsVisible) {
        mainUiBrowser.execute(`setPlaybackState(false, null, null);`);
    }

    if (notifyServer && !fromSync && mp.players.local.vehicle && vehicleHasRadio) {
        mp.events.callRemote('server:xmradio:requestStateChange', null, null, false, currentVolume);
    }
}

// --- Manipuladores de Eventos do RAGE MP (Servidor e HTMLs) ---

// Do Servidor: Veículo tem/não tem rádio
mp.events.add('client:xmradio:vehicleHasRadio', (hasRadio: boolean) => {
    console.log(`[XMCLIENT] vehicleHasRadio: ${hasRadio}`);
    vehicleHasRadio = hasRadio;
    if (!hasRadio && isRadioFeatureGloballyOn) {
        stopRadioPlayback(false, true); // Para tudo se o veículo não tem mais rádio
        if (mainUiIsVisible) destroyMainUiBrowser(); // Fecha UI se saiu para um carro sem rádio
    }
});

// Do Servidor: Jogador saiu do veículo
mp.events.add('client:xmradio:leftVehicle', () => {
    console.log('[XMCLIENT] leftVehicle');
    vehicleHasRadio = false; // Não está mais em um veículo (com rádio)
    if (isRadioFeatureGloballyOn) {
        // O rádio é do veículo, então para para este jogador.
        // O servidor vai parar de enviar syncs para ele.
        stopRadioPlayback(true, false); // fromSync=true (age como se fosse ordem do servidor), notifyServer=false (não precisa notificar de volta)
        if (mainUiIsVisible) destroyMainUiBrowser();
    }
});

// Do Servidor: Comando /xmradio usado
mp.events.add('client:xmradio:toggleUI', () => {
    console.log('[XMCLIENT] toggleUI command received');
    if (!vehicleHasRadio) {
        mp.gui.chat.push("!{#FF8C00}AVISO: !{#FFFFFF}Este veículo não possui XM Radio instalado.");
        return;
    }

    if (mainUiIsVisible) {
        hideMainUiBrowser();
        // Se o rádio estiver tocando, o mini-player deve aparecer/estar visível
        if (isRadioFeatureGloballyOn && miniPlayerReady && miniPlayerBrowser) {
            miniPlayerBrowser.execute(`toggleVisibility(true);`);
        }
    } else {
        createMainUiBrowser();
        // Se o rádio estiver tocando, esconde o mini-player pois a UI principal está abrindo
        if (isRadioFeatureGloballyOn && miniPlayerReady && miniPlayerBrowser) {
             miniPlayerBrowser.execute(`toggleVisibility(false);`);
        }
    }
});

// Do Servidor: Sincronização do estado do rádio
mp.events.add('client:xmradio:syncStation', (url: string | null, name: string | null, isPlaying: boolean, volume: number) => {
    console.log(`[XMCLIENT] syncStation: URL=${url}, Name=${name}, Playing=${isPlaying}, Vol=${volume}`);
    if (isPlaying && url && name) {
        startOrUpdateRadioPlayback(url, name, volume, true);
    } else {
        // Se isPlaying é false, significa que o rádio do veículo foi desligado
        stopRadioPlayback(true, false); // fromSync=true, notifyServer=false (já é uma notificação)
    }
});

// Do audio_handler.html: Handler de áudio está pronto
mp.events.add('client:audio_handler:ready', () => {
    console.log('[XMCLIENT] Evento: Audio Handler está pronto.');
    audioHandlerReady = true;
    if (audioHandlerBrowser) { // Garante que o browser ainda existe
        audioHandlerBrowser.execute(`setStreamVolume(${currentVolume});`); // Define o volume inicial/atual
        if (isRadioFeatureGloballyOn && currentRadioUrl) { // Se uma rádio deveria estar tocando
            audioHandlerBrowser.execute(`playStream('${currentRadioUrl}', ${currentVolume});`);
        }
    }
});

// Do miniplayer.html: Mini-player está pronto
mp.events.add('client:miniplayer:ready', () => {
    console.log('[XMCLIENT] Evento: Mini Player está pronto.');
    miniPlayerReady = true;
    if (miniPlayerBrowser) { // Garante que o browser ainda existe
        if (isRadioFeatureGloballyOn && currentRadioName) {
            miniPlayerBrowser.execute(`updateRadioInfo('${currentRadioName}');`);
            miniPlayerBrowser.execute(`toggleVisibility(true);`);
        } else {
            miniPlayerBrowser.execute(`toggleVisibility(false);`);
        }
    }
});

// Do xmradio.html (UI Principal): UI Principal está pronta
mp.events.add('client:xmradio:mainUiReady', () => {
    console.log('[XMCLIENT] Evento: Main UI está pronta.');
    mainUiReady = true;
    if (mainUiBrowser) { // Garante que o browser ainda existe
        mainUiBrowser.execute(`loadRadioList(${JSON.stringify(PREDEFINED_RADIOS)});`);
        mainUiBrowser.execute(`setVolumeSlider(${currentVolume});`);
        if (isRadioFeatureGloballyOn && currentRadioName && currentRadioUrl) {
            mainUiBrowser.execute(`setPlaybackState(true, '${currentRadioName}', '${currentRadioUrl}');`);
        } else {
            mainUiBrowser.execute(`setPlaybackState(false, null, null);`);
        }
    }
});

// Do xmradio.html: Jogador pediu para tocar uma estação
mp.events.add('client:xmradio:playStationRequested', (url: string, name: string) => {
    console.log(`[XMCLIENT] playStationRequested: URL=${url}, Name=${name}`);
    startOrUpdateRadioPlayback(url, name, currentVolume, false);
    hideMainUiBrowser(); // Esconde a UI principal após selecionar uma rádio
});

// Do xmradio.html: Jogador fechou a UI Principal (pelo 'X' ou ESC)
mp.events.add('client:xmradio:mainUiClosed', () => {
    console.log('[XMCLIENT] mainUiClosed (via X ou ESC)');
    // A UI HTML já chamou window.hideUI() nela mesma.
    // O client TS só precisa esconder o cursor.
    if (mp.gui.cursor.visible) {
        mp.gui.cursor.show(false, false);
    }
    mainUiIsVisible = false;
    // Se o rádio estiver tocando, o mini-player deve aparecer/estar visível
    if (isRadioFeatureGloballyOn && miniPlayerReady && miniPlayerBrowser) {
        miniPlayerBrowser.execute(`toggleVisibility(true);`);
    }
});

// Do xmradio.html: Volume alterado na UI Principal
mp.events.add('client:xmradio:volumeChanged', (newVolume: number) => {
    console.log(`[XMCLIENT] volumeChanged: ${newVolume}`);
    currentVolume = newVolume;
    if (audioHandlerReady && audioHandlerBrowser) {
        audioHandlerBrowser.execute(`setStreamVolume(${currentVolume});`);
    }
    // Notifica o servidor para sincronizar o volume se estivermos em um veículo e o rádio ligado
    if (mp.players.local.vehicle && vehicleHasRadio && isRadioFeatureGloballyOn) {
        mp.events.callRemote('server:xmradio:requestVolumeChange', currentVolume);
    }
});

// Do miniplayer.html ou xmradio.html: Pedido para desligar completamente o rádio
mp.events.add('client:xmradio:requestFullStop', () => {
    console.log('[XMCLIENT] requestFullStop');
    stopRadioPlayback(false, true); // fromSync=false, notifyServer=true (para que outros parem)
    // A UI principal não precisa ser destruída aqui, pode ser apenas resetada
    if (mainUiBrowser && mainUiReady){
        mainUiBrowser.execute(`setPlaybackState(false, null, null);`);
    }
});

// Do audio_handler.html: Erro ao tocar áudio
mp.events.add('client:xmradio:audioHandlerError', (errorMessage: string) => {
    console.error(`[XMCLIENT] AudioHandler Error: ${errorMessage}`);
    mp.gui.chat.push(`!{#FF3333}[Erro no Rádio] !{#FFFFFF}${errorMessage.substring(0, 100)}`);
    // Poderia tentar parar o rádio ou mostrar um feedback mais claro
    if (miniPlayerReady && miniPlayerBrowser) {
        miniPlayerBrowser.execute(`updateRadioInfo('Erro na Rádio');`);
    }
});


// --- Inicialização / Limpeza ---
mp.events.add('playerQuit', () => {
    if (mainUiBrowser) mainUiBrowser.destroy();
    if (audioHandlerBrowser) audioHandlerBrowser.destroy();
    if (miniPlayerBrowser) miniPlayerBrowser.destroy();
    mainUiBrowser = null;
    audioHandlerBrowser = null;
    miniPlayerBrowser = null;
});

console.log('[CLIENT] Módulo XM Radio (v2 - Persistente/Sincronizado) carregado.');

// Lembre-se de importar este arquivo no client/index.ts principal do seu gamemode.
// ex: import './modules/xmradio'; (ou o caminho correto)