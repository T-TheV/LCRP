/* Carrega variáveis de ambiente, logs iniciais, handlers genéricos */
import './setup';

/* Extende PlayerMp com dist / giveMoney (precisa vir antes dos módulos) */
import '../server/modules/trucking/utils/extendedPlayer.utils';


/* Constantes compartilhadas (exemplo) */
import { SHARED_CONSTANTS } from '@shared/constants';

/* Exemplo de uso das constantes */
console.log(SHARED_CONSTANTS.HELLO_WORLD);



/* Módulos de gameplay */
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.ELETRICISTA);
import './modules/eletricista';
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.MEIO_ELETRICISTA);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.FIM_ELETRICISTA);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.TRUCKING);
import './modules/trucking';
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.MEIO_TRUCKING);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.FIM_TRUCKING);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.COORDS);
import './modules/coords';
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.MEIO_COORDS);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.FIM_COORDS);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.XMRADIO);
import './modules/xmradio';
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.MEIO_XMRADIO);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.FIM_XMRADIO);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.MOTORISTA_ONIBUS);
import './modules/motoristaOnibus';
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.MEIO_MOTORISTA_ONIBUS);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.FIM_MOTORISTA_ONIBUS);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.TELEPORTE);
import './modules/teleporte';
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.MEIO_TELEPORTE);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.FIM_TELEPORTE);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.FURNITURE);
import './modules/furniture';
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.MEIO_FURNITURE);
console.log(SHARED_CONSTANTS.MODULOS_GAMEPLAY.FIM_FURNITURE);
/* Módulos de administração */