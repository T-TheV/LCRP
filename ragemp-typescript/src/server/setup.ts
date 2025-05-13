/// <reference path="./@types/rage-mp/index.d.ts" />

mp.events.add('server:initialize', () => {
    mp.console.logInfo('[Servidor] Aqui deveria inicializar o servidor com configurações básicas.');
});