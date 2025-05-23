# 🔧 Sistema de Emprego: Eletricista

Sistema de emprego baseado em checkpoints, voltado para roleplay de serviço urbano com rota e progressão simples.

---

## 🚀 Comandos

| Comando               | Descrição                                                      |
|-----------------------|----------------------------------------------------------------|
| `/iniciartrabalho`    | Inicia o emprego de eletricista. Spawna van e inicia rota.     |
| `/reparoeletrico`     | Executa o reparo no ponto atual. Necessário estar no local.    |
| `/finalizartrabalho`  | Encerra o trabalho após os 5 reparos. Entrega a van e recebe.  |
| `/tpemprego`          | (Admin/Dev) Teleporta para o ponto de emprego para testes.     |

---

## 📍 Localização

- **Ponto de Emprego**: Exibe um texto 3D fixo com:
Ponto de Emprego
Eletricista
/iniciartrabalho para começar


- **Pontos de Reparo**: São x locais no mapa que exibem texto 3D e um blip com rota durante o trabalho.

---

## 📦 Funcionalidades

- Geração de van de serviço (`burrito`) com placa personalizada
- Sistema de progresso (1/x até 5/x) com HUD
- Verificação de distância para reparo
- Animação de conserto (`fixing_a_ped`)
- Rota amarela (blip + setRoute)
- Remoção de textos, blips e HUD ao finalizar
- Pagamento final de `$250` ao entregar a van

---

## 🎨 Client-side

- Textos 3D via `mp.labels.new`
- HUD com texto inferior central atualizado por evento
- Blips com rota no minimapa
- Blip fixo no ponto de emprego com ícone `354`

---

## 🛠️ Desenvolvimento

A estrutura do sistema está localizada em:

- `modules/eletricista/controller/eletricista.controller.ts`
- `modules/eletricista/events/eletricista.events.ts`
- `modules/eletricista/data/pontos.ts`
- `modules/eletricista/index.ts`
- `client/index.ts` (eventos visuais e HUD)

---

## 📌 Observações

- O sistema utiliza `Map<number, X>` para armazenar progresso e labels por jogador
- Requer o campo `"nodejs": true` no `conf.json`
- `mp.labels.new` exige `drawDistance` e `dimension` corretos para aparecer

---

## ✅ Exemplo de fluxo

1. Jogador vai ao ponto de emprego
2. Digita `/iniciartrabalho`
3. Vai aos pontos e digita `/reparoeletrico`
4. Volta ao ponto de início e digita `/finalizartrabalho`
5. Recebe pagamento e HUD/textos são limpos

---

> Desenvolvido por [TheV] com ♥.
