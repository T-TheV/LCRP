import { criarTeleporte, definirSaida, deletarTeleporte } from '../data/teleporte.data';

const criacoesPendentes = new Map<number, string>();

mp.events.addCommand('criarteleporte', (player: PlayerMp, nome: string) => {
  if (!nome) return player.outputChatBox('!{ffcc00}Uso: /criarteleporte [nome]');

  const entrada = player.position;
  const tele = criarTeleporte(nome, entrada);
  criacoesPendentes.set(player.id, nome);

  mp.labels.new(`[${tele.id}] ${tele.nome}`, entrada, {
    drawDistance: 20,
    dimension: player.dimension,
    los: false
  });

  player.outputChatBox(`!{90ee90}Teleporte '${nome}' criado! Vá até o local de saída e use /criarteleportesaida ${nome}`);
});

mp.events.addCommand('criarteleportesaida', (player: PlayerMp, nome: string) => {
  if (!nome) return player.outputChatBox('!{ffcc00}Uso: /criarteleportesaida [nome]');

  const saida = player.position;
  const sucesso = definirSaida(nome, saida);

  if (sucesso) {
    mp.labels.new(`[Saída] ${nome}`, saida, {
      drawDistance: 20,
      dimension: player.dimension,
      los: false
    });
    player.outputChatBox(`!{90ee90}Saída do teleporte '${nome}' definida com sucesso!`);
    criacoesPendentes.delete(player.id);
  } else {
    player.outputChatBox(`!{ff4444}Erro: teleporte '${nome}' não encontrado.`);
  }
});

mp.events.addCommand('deletarteleporte', (player: PlayerMp, nome: string) => {
  if (!nome) return player.outputChatBox('!{ffcc00}Uso: /deletarteleporte [nome ou id]');

  const sucesso = deletarTeleporte(nome);

  if (sucesso) {
    player.outputChatBox(`!{ff5555}Teleporte '${nome}' deletado.`);
  } else {
    player.outputChatBox(`!{ff4444}Erro: Teleporte '${nome}' não encontrado.`);
  }
});
