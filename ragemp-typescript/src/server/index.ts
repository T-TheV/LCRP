/* Carrega variáveis de ambiente, logs iniciais, handlers genéricos */
import './setup';

/* Extende PlayerMp com dist / giveMoney (precisa vir antes dos módulos) */
import '../server/modules/trucking/utils/extendedPlayer.utils';

/* Módulos de gameplay */
import './modules/eletricista';
import './modules/trucking';
import './modules/coords';

/* Constantes compartilhadas (exemplo) */
import { SHARED_CONSTANTS } from '@shared/constants';

/* Exemplo de uso das constantes */
console.log(SHARED_CONSTANTS.HELLO_WORLD);
