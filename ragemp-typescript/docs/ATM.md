
# 💳 Sistema de ATM — Liberty City RP

Sistema completo de caixas eletrônicos com economia dinâmica, entrega de malotes, hacking e falhas técnicas. Desenvolvido em **TypeScript (RageMP)** e **React + Vite** para a interface NUI.

---

## 🧩 Tecnologias Utilizadas

- **RageMP + TypeScript** (Backend)
- **React + Vite** (Frontend NUI)
- **Emotion + Styled-Components** (Estilização)
- **PostgreSQL** (Banco de dados - opcional)
- Baseado no boilerplate: [leonardssh/ragemp-typescript](https://github.com/leonardssh/ragemp-typescript)

---

## 📦 Funcionalidades Gerais

### 🎮 Interface ATM (`/atm`)
- Abertura via comando `/atm` (ou interação futura)
- Saque (se player tiver saldo bancário e ATM saldo em caixa)
- Transferência bancária entre jogadores (planejado)
- Fechar interface com `ESC` ou botão
- Feedback visual de sucesso e erro
- Design escuro, responsivo, moderno e animado

### 🧠 Lógica de ATM
- Cada ATM possui **5 slots** com capacidade de **$25.000** cada
- Cada saque libera 1 slot a cada **$20.000** retirados
- Interface baseada em NUI/React, integrada via `window.mp.trigger`

### ⚠️ Falhas Técnicas
- Eventos técnicos aleatórios por tempo ou manual:
  - Vandalismo
  - Reinicialização
  - Lentidão
  - Falso positivo de skimmer
- ATM se torna temporariamente inoperante

---

## 💼 Entrega de Malotes — Gruppe Sechs (`/entregamalotes`)

Sistema completo de entregas com apenas **um comando**.

### 🚚 Lógica Completa
1. **/entregamalotes**
   - Abre mapa com todos os ATMs que precisam de abastecimento
   - Comissão dinâmica baseada na distância (máx. $5.000)
2. **Após escolher o ATM**:
   - Jogador é guiado ao **centro de valores**
   - Checkpoint aparece para **entrar no veículo** e **ir até o checkpoint de malotes**
   - Ao sair do veículo: novo checkpoint no jogador
   - Jogador recebe **1 malote**
   - Deve colocá-lo no porta-malas do veículo (checkpoint detecta)
   - Processo repete até completar a **quantidade necessária de malotes para o ATM**
3. **Entrega**:
   - Checkpoint no veículo leva até o **ATM escolhido**
   - Jogador deve sair com malote em mãos/inventário
   - Passar sobre o ATM entrega automaticamente o malote
   - Comissão baseada no número de malotes entregues
   - Processo se repete até entregar todos os malotes

---

## 🕵️‍♂️ Hacking & Skimmer

- Sistema de Skimmer (via item e minigame React estilo Lester)
- Cooldown para coleta de lucros
- Detectável por policiais
- Removível via comando

---

## 👮 Comandos Policiais

```bash
/escanearatm         # Verifica se o ATM possui skimmer instalado
/removerskimmer      # Remove o skimmer se autorizado e próximo
````

---

## 🧑‍💼 Comando de Emprego

```bash
/entregamalotes      # Inicia todo o processo de entrega de malotes
```

---

## 🛠️ Comandos Admin

```bash
/trocarmalote [id]           # Troca todos os malotes do inventário por dinheiro
/atm.admin reset [id]        # Reseta o estado do ATM
/atm.admin money [id] [val]  # Define saldo manualmente
/atm.admin tp [id]           # Teleporta para o ATM
/atm.admin reload            # Recarrega sistema de ATMs
```

---

## 🔒 Segurança

* Verificação de distância e inventário
* Validação de saldo do banco e do ATM
* Proteção contra spam de comandos
* Sistema de logs para auditoria de admins e policiais

---

## 📁 Estrutura Modular

### Backend (`modules/`)

```
atm/
│   ├── controller/      // comandos e eventos
│   ├── services/        // lógica de saque/deposito
│   ├── events/          // falhas técnicas e proximidade
│   ├── types/           // tipagem ATMData
│   └── index.ts
job/
│   └── entregamalotes/  // lógica completa do ciclo de entrega
skimmer/
│   └── nui/             // minigame de hacking
police/
logs/
utils/
shared/
```

### Frontend (NUI React)

```
pages/atm/
│   ├── ATM.tsx
│   ├── styles.ts
│   ├── index.html
│   └── useATM.ts
vite.config.ts
global.d.ts
```

---

## 📚 Documentação Técnica

* Tipagem customizada via `global.d.ts`
* Comunicação via `window.mp.trigger()`
* Eventos recebidos com `window.addEventListener('message', ...)`
* Logs administrativos e integração futura com painel

---

## ✅ Requisitos para funcionamento

* RageMP client-side com CEF/NUI habilitado
* React buildado com Vite (output para `client_packages/cef`)
* Componente ATM incluído no carregamento da tela
* Backend com RageMP e TypeScript ativos

---

Desenvolvido com ❤️ para Liberty City RP
Modular. Realista. Escalável.

