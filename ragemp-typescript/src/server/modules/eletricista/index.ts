import './events/eletricista.events';
import { pontoInicialEletricista } from './data/pontos';

// Texto fixo no ponto de emprego
mp.labels.new(
	'~w~Ponto de Emprego\n~y~Eletricista~n~~w~/iniciartrabalho para começar',
	pontoInicialEletricista,
	{
		font: 0,
		drawDistance: 30,
		los: true,
        dimension: 0,
	}
);

// Criação do blip fixo ao entrar no servidor
mp.events.add('playerReady', (player) => {
	player.call('createBlipInicialEletricista', [
		pontoInicialEletricista.x,
		pontoInicialEletricista.y,
		pontoInicialEletricista.z
	]);
});

console.log('[Eletricista] Módulo carregado com sucesso.');