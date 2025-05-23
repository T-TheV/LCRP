// src/server/modules/trucking/events/commands.events.ts
// -----------------------------------------------------
// Comandos públicos do Truck Job.

import { truckingController } from '../controller/trucking.controller';
import { findNearestIndustry } from '../data/industries';
import { RANKS, Rank } from '../data/ranks';

/* /truckstart */
mp.events.addCommand('truckstart', (p) => truckingController.start(p));

/* /truckcancel */
mp.events.addCommand('truckcancel', (p) => truckingController.cancel(p, 'cancelou o job'));

/* /industry <info|buy|sell> [qtd] */
mp.events.addCommand('industry', (p, full) => {
  const [sub = '', arg] = full.trim().split(' ');
  const ind = findNearestIndustry(p);
  if (!ind) return p.notify('❌ Nenhuma indústria perto de você.');

  switch (sub.toLowerCase()) {
    case 'info':
    case '':
      return p.outputChatBox(
        (`📍 ${ind.name}\n` +
          `Tipo: ${ind.type}\n` +
          `Estoque: ${ind.stock}/${ind.stockMax}\n` +
          (ind.type === 'primary'
            ? `Preço p/ comprar: $${ind.priceSell}`
            : `Preço p/ vender:  $${ind.priceBuy}`))
          .replace(/\n/g, '<br/>'),
      );

    case 'buy': {
      if (truckingController.hasActiveJob(p))
        return p.notify('Você já está transportando carga.');
      const qty = Math.max(Number(arg) || 1, 1);
      return truckingController.buyCargo(p, ind, qty);
    }

    case 'sell':
      return truckingController.sellCargo(p, ind);

    default:
      p.outputChatBox('Uso: /industry <info|buy|sell> [quantidade]');
  }
});

/* /truckhoras */
mp.events.addCommand('truckhoras', (p) => {
  const hrs = p.getVariable('truckingHours') || 0;
  const rank: Rank = [...RANKS].reverse().find((r) => hrs >= r.hours) || RANKS[0];
  const next = RANKS.find((r) => r.hours > rank.hours);
  const faltam = next ? next.hours - hrs : 0;

  p.outputChatBox(
    (`🕒 Horas: ${hrs.toFixed(1)}\n` +
      `Rank: ${rank.label}\n` +
      (next ? `Faltam ${faltam.toFixed(1)}h para ${next.label}` : 'Rank máximo atingido!'))
      .replace(/\n/g, '<br/>'),
  );
});
