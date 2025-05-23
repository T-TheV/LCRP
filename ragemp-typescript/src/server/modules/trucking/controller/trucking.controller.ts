// src/server/modules/trucking/controller/trucking.controller.ts
// -----------------------------------------------------------------
// Controlador principal do Truck Job – mantém todo o estado
// e executa as regras de negócio. Server‑first, sem lógicas soltas
// em handlers.

import { INDUSTRIES, Industry } from '../data/industries';
import { RANKS, Rank } from '../data/ranks';
import { CARGO_TYPES, CargoType } from '../data/cargo-types';

// ────────────────────────────────────────────────────────────────
interface JobState {
  cargoType: CargoType;
  qty: number;
  originId: number;
  destId: number;
  createdAt: number;
}

class TruckingController {
  private jobs = new Map<number, JobState>();

  // ─── helpers internos ────────────────────────────────────────
  private rankFor(player: PlayerMp): Rank {
    const hrs = player.getVariable('truckingHours') || 0;
    return [...RANKS].reverse().find(r => hrs >= r.hours)!;
  }

  private allowedVehicle(player: PlayerMp, rank: Rank): boolean {
    const veh = player.vehicle;
    return !!veh && rank.allowedVehModels.includes(veh.model);
  }

  private sendHud(player: PlayerMp, line1 = '', line2 = ''): void {
    if (!line1) player.call('trucking:hud:clear');
    else player.call('trucking:hud', [line1, line2]);
  }

  private pickCargo(): CargoType {
    // Sorteia um tipo de carga da lista global
    return CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)];
  }

  // ─── API pública para os handlers ────────────────────────────
  start(player: PlayerMp): void {
    const rank = this.rankFor(player);
    if (!this.allowedVehicle(player, rank)) {
      return player.notify('❌ Veículo não permitido para seu rank.');
    }
    if (this.jobs.has(player.id)) {
      return player.notify('Você já está em um serviço ativo.');
    }
    player.notify(`🚚 Job iniciado como ${rank.label}. Vá até uma indústria primária para comprar carga.`);
  }

  buyCargo(player: PlayerMp, industry: Industry, qty: number): void {
    const rank = this.rankFor(player);

    if (industry.type !== 'primary') {
      return player.notify('Esta indústria não vende carga primária.');
    }
    if (!this.allowedVehicle(player, rank)) {
      return player.notify('Seu veículo não é permitido para este rank.');
    }
    if (qty > rank.capacity) {
      return player.notify(`Seu veículo comporta no máximo ${rank.capacity} caixas.`);
    }
    if (industry.stock < qty) {
      return player.notify('Estoque insuficiente nesta indústria.');
    }

    // destino qualquer indústria secundária ou terciária diferente da origem
    const dest = INDUSTRIES.find(i => i.type !== 'primary' && i.id !== industry.id);
    if (!dest) return player.notify('Nenhum destino válido encontrado.');

    industry.stock -= qty;

    const cargoType = this.pickCargo();

    this.jobs.set(player.id, {
      cargoType,
      qty,
      originId: industry.id,
      destId: dest.id,
      createdAt: Date.now()
    });

    player.notify(`✅ Comprou ${qty} caixas de ${cargoType}. Entregue em ${dest.name}.`);
    this.sendHud(player, `${qty}/${rank.capacity}`, dest.name);
  }

  sellCargo(player: PlayerMp, industry: Industry): void {
    const state = this.jobs.get(player.id);
    if (!state) return player.notify('Nenhuma carga ativa.');

    if (industry.id !== state.destId) {
      return player.notify('Este não é o destino correto.');
    }

    const payment = industry.priceBuy * state.qty;
    player.giveMoney?.(payment);
    industry.stock = Math.min(industry.stock + state.qty, industry.stockMax);

    const hrsDelta = state.qty / 10;
    const newTotal = (player.getVariable('truckingHours') || 0) + hrsDelta;
    player.setVariable('truckingHours', newTotal);

    const prevRank = this.rankFor(player);
    const nextRank = RANKS.find(r => r.hours > prevRank.hours && r.hours <= newTotal);
    if (nextRank) player.notify(`🎉 Novo rank alcançado: ${nextRank.label}!`);

    player.notify(`💰 Pagamento: $${payment}.`);
    this.sendHud(player);
    this.jobs.delete(player.id);
  }

  cancel(player: PlayerMp, reason = 'cancelou o serviço'): void {
    const state = this.jobs.get(player.id);
    if (!state) return;

    const origin = INDUSTRIES.find(i => i.id === state.originId);
    if (origin) {
      origin.stock = Math.min(origin.stock + state.qty, origin.stockMax);
    }
    player.giveMoney?.(-500);
    player.notify(`❗ Você ${reason}. Multa de $500.`);
    this.sendHud(player);
    this.jobs.delete(player.id);
  }

  hasActiveJob(player: PlayerMp): boolean {
    return this.jobs.has(player.id);
  }

  clearState(player: PlayerMp): void {
    this.jobs.delete(player.id);
    this.sendHud(player);
  }
}

export const truckingController = new TruckingController();
