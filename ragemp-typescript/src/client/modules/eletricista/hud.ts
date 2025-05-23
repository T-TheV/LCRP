/**
 * HUD – Sistema de Eletricista
 * Só lida com texto na tela e nada além disso.
 */

let hudReparoTexto = '';
let mostrarHudReparo = false;

// Atualiza texto e liga temporizador
mp.events.add('atualizarReparoHUD', (atual: number, total: number) => {
	hudReparoTexto = `🔧 Reparos concluídos: ${atual - 1}/${total}`;
	mostrarHudReparo = true;

	setTimeout(() => (mostrarHudReparo = false), 8000);
});

// Desenha o texto a cada frame
mp.events.add('render', () => {
	if (!mostrarHudReparo || !hudReparoTexto) return;

	mp.game.graphics.drawText(
		hudReparoTexto,
		[0.5, 0.92],
		{
			font: 4,
			color: [255, 255, 255, 255],
			scale: [0.4, 0.4],
			outline: true,
			centre: true
		}
	);
});
