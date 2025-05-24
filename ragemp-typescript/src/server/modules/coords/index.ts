import { handleCoordsCommand } from './controller/coords.controller';

// Registra o comando '/coords' e associa à função handleCoordsCommand
mp.events.addCommand('coords', handleCoordsCommand);

// Log para indicar que o módulo e o comando foram carregados e registrados
console.log('[Servidor] Módulo COORDS carregado e comando /coords registrado.');

// Você poderia adicionar aqui chamadas para carregar outros setups do módulo,
// por exemplo, se tivesse um arquivo setup.ts:
// import setupCoordsModule from './setup';
// setupCoordsModule();