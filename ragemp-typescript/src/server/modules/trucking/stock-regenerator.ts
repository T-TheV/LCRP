/**
 * src/server/modules/trucking/stock-regenerator.ts
 * -----------------------------------------------
 * Reabastece estoque das indústrias de hora em hora.
 */

import { INDUSTRIES, saveIndustries } from './data/industries';

/* Configurações */
const TICK_MS = 60 * 60 * 1000;  // 1 h
const REGEN   = 100;             // +100 unidades por tick

function regenLoop() {
  let changed = false;

  INDUSTRIES.forEach((ind) => {
    if (ind.stock < ind.stockMax) {
      ind.stock = Math.min(ind.stock + REGEN, ind.stockMax);
      changed = true;
    }
  });

  if (changed) {
    saveIndustries();

    // Opcional: avisa players próximos
    /*
    mp.players.forEach((p) => {
      if (p.dist && INDUSTRIES.some((i) => p.dist(i.pos) < 50))
        p.notify('🔄 Estoque das indústrias foi reabastecido.');
    });
    */
  }
}

/* Inicia cron job */
setInterval(regenLoop, TICK_MS);
