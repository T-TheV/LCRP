const labelsCriadas: TextLabelMp[] = [];

// Reage à tecla E
mp.keys.bind(0x45, true, () => {
  const player = mp.players.local;

  const podeUsar =
    player &&
    !mp.gui.cursor.visible &&
    !mp.players.local.isTypingInTextChat &&
    !player.getVariable('isMenuOpen'); // ajuste conforme seu sistema

  if (!podeUsar) return;

  mp.events.callRemote('teleporte:verificarInteracao');
});

// Criação de labels 3D recebidos do servidor
mp.events.add('teleporte:criarLabel', (id: number, nome: string, pos: Vector3, tipo: 'entrada' | 'saida') => {
  const texto = tipo === 'saida' ? `[Saída] ${nome}` : `[${id}] ${nome}`;

  const label = mp.labels.new(texto, pos, {
    drawDistance: 20,
    los: false,
    dimension: mp.players.local.dimension,
    font: 4,
    color: [255, 255, 255, 255]
  });

  labelsCriadas.push(label);
});

// Opcional: remover todos os labels se necessário
mp.events.add('teleporte:limparLabels', () => {
  labelsCriadas.forEach(l => l.destroy());
  labelsCriadas.length = 0;
});
