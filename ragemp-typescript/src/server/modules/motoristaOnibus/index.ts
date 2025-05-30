import './data/motorista.data';
import './types/passageiro'; // se usar tipos globais, pode não ser necessário

import './controller/motorista.controller';
import './commands/motorista.commands';
import './events/motorista.events';
import { pontoInicialMotorista } from './data/motorista.data';


// Texto fixo no ponto de emprego
mp.labels.new(
    '~w~Ponto de Emprego\n~y~Motorista~n~~w~/iniciaronibus para começar',
    pontoInicialMotorista,
    {
        font: 0,
        drawDistance: 30,
        los: true,
        dimension: 0,
    }
);