/**
 * src/server/modules/trucking/index.ts
 * ------------------------------------
 * Ponto de entrada server-side do Truck Job.
 * Importa e inicializa tudo que o módulo precisa.
 */

/* Dados + blips/labels (carrega JSON) */
import './data/industries';

/* Controller singleton (exportável) */
export { truckingController } from './controller/trucking.controller';

/* Cron de regeneração de estoque */
import './stock-regenerator';

/* Comandos de jogador */
import './events/commands.events';

/* Comandos de configuração (/criarrota, /aveh, /reloadindustrias) */
import './events/admin-commands.events';

/* Hooks globais (playerQuit ➜ multa/estoque) */
import './events/server.events';
