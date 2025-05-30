# Full Documentation: Architecture System Integrated with Furniture

## Overview

This document defines the complete specification of the Architecture System for the RAGE.MP server, integrating directly with the existing Furniture system. The system is designed to work with raycasting and full CEF responsiveness.

## Objectives

* Create an architect job with real and differentiated functionalities.
* Allow interior editing by third parties under authorized contracts.
* Integrate ambient presets and pre-defined styles.
* Support raycast for visual selection and real-time editing.
* Allow architects to load their previous decoration templates.
* Implement CCTV, safe, and alarm as furniture modules.
* Integrate furniture purchasing directly through the UI.
* Centralize everything through a modern interface with tabs: Furnitures, Shop, Safe, CCTV, Alarm, Architect, Settings.

## Interface Tabs (Top Menu)

### 1. Furnitures

* List all placed furnitures.
* Actions: Edit, Clone, Hide, Favorite.
* Raycast with "Select with mouse".
* Filter by name, category, zone.
* Allows setting or changing zone.

### 2. Shop

* Full catalog of furnitures by category.
* Filter by name, price, premium-only.
* Visual preview.
* “Buy and place” button activates editing mode.

### 3. Safe (/safe)

* Password input.
* Side-by-side inventory (player and safe).
* Actions: Deposit, Withdraw, Change password.
* Raycast required to display.

### 4. CCTV (/cctv)

* List of cameras linked to the property.
* Switch views by name.
* Visualization via `setCamCoord`.

### 5. Alarm (/alarm)

* Button to activate/deactivate.
* Current status (active/inactive).
* Visual and sound effects (red light and siren).
* IC notification to owner.

### 6. Architect

* Only accessible with active permission.
* Start and finish project.
* Apply styles (modern, industrial, rustic, etc).
* Apply architect’s previous presets.
* Export/import saved layouts.

### 7. Settings

* Move/rotate speed.
* Auto snap to floor/walls.
* Enable/disable HUD and outline.
* Light/dark theme.
* Reset UI to default.

## Technologies Used

* RAGE.MP (client/server)
* TypeScript (following leonardssh boilerplate)
* CEF (HTML/CSS/JS) for interfaces (safe, presets, CCTV, shop)
* Raycasting for object selection and interaction

## Step-by-step Priority List

### High Priority

1. Implement `/mobilias` command
2. Create modern UI with all 7 functional tabs
3. Raycast for furniture selection with mini HUD
4. Furniture purchase system with preview and balance integration

### Medium Priority

5. Architect styles + zone presets
6. Alarm integration with effects and sound
7. CCTV interface with camera navigation
8. Architect portfolio system and reusable templates

### Low Priority

9. Preset export between properties
10. Admin logs and security
11. Implement `/cofre`, `/cctv`, `/alarme` commands
12. Safe with interactive inventory and password system

## Notes

* Available commands: `/mobilias`, `/cofre`, `/cctv`, `/alarme`.
* All other interactions occur via intuitive UI.
* UI must follow modern best practices: accessible, clean, responsive.
* Raycast is mandatory for physical object interactions (safe, camera).

---

PORTUGUESE:

# Documentação Completa: Sistema de Arquitetura Integrado ao Furniture

## Visão Geral

Este documento define a especificação completa do sistema de Arquitetura para servidor RAGE.MP, integrando-se diretamente ao sistema de mobílias (Furniture) existente. O sistema está estruturado para trabalhar com raycasting e responsividade total com CEF.

## Objetivos

* Criar um emprego de arquiteto com funcionalidades reais e diferenciais.
* Permitir edição de interiores por terceiros sob contrato autorizado.
* Integrar presets de ambientes e estilos pré-montados.
* Suportar raycast para seleção visual e edição em tempo real.
* Permitir arquiteto carregar seus templates de decorações anteriores.
* Implementar CCTV, cofre e alarme como módulos do sistema de mobília.
* Integrar sistema de compra de mobílias diretamente pela UI.
* Centralizar tudo por interface moderna com abas: Mobílias, Comprar, Cofre, CCTV, Alarme, Arquiteto, Configurações.

## Abas da Interface (Menu Superior)

### 1. Mobílias

* Lista de todas as mobílias posicionadas.
* Ações: Editar, Clonar, Ocultar, Favoritar.
* Raycast com "Selecionar com o mouse".
* Filtro por nome, categoria, zona.
* Permite definir ou alterar zona.

### 2. Comprar

* Catálogo completo de mobílias por categoria.
* Filtro por nome, preço, exclusivas premium.
* Preview visual.
* Botão “Comprar e posicionar” que ativa o modo de edição.

### 3. Cofre (/cofre)

* Input de senha.
* Inventário lado a lado (jogador e cofre).
* Ações: Depositar, Retirar, Trocar senha.
* Raycast necessário para exibir.

### 4. CCTV (/cctv)

* Lista de câmeras vinculadas ao interior.
* Alternar visualização por nome.
* Visualização por `setCamCoord`.

### 5. Alarme (/alarme)

* Botão para ativar/desativar.
* Estado atual (ativo/inativo).
* Efeitos visuais e sonoros (luz vermelha e sirene).
* Notificação IC ao dono.

### 6. Arquiteto

* Apenas acessível com permissão ativa.
* Iniciar e finalizar projeto.
* Aplicar estilos (moderno, industrial, rústico etc).
* Aplicar presets anteriores do arquiteto.
* Exportar/importar layouts salvos.

### 7. Configurações

* Velocidade de movimentação/rotação.
* Snap automático em chão/paredes.
* Habilitar/desabilitar HUD e contorno.
* Tema claro/escuro.
* Resetar interface para padrão.

## Tecnologias Utilizadas

* RAGE.MP (client/server)
* TypeScript (seguindo boilerplate do leonardssh)
* CEF (HTML/CSS/JS) para as interfaces (cofre, presets, CCTV, compra)
* Raycasting para seleção de objetos e interações

## Lista de Prioridades (Passo a passo)

### Prioridade Alta

1. Implementar comandos `/mobilias`
2. Criar UI moderna com todas as 7 abas funcionais
3. Raycast de seleção de mobília com mini HUD
4. Sistema de compra de mobílias com preview e integração com saldo

### Prioridade Média

5. Estilos do arquiteto + presets de ambiente com zonas
6. Integração do alarme com efeitos visuais e som
7. Interface de câmeras com navegação
8. Sistema de portfólio do arquiteto e templates reaplicáveis

### Prioridade Baixa

9. Exportação de presets entre propriedades
10. Logs e segurança para admins
11. Implementar comandos `/cofre`, `/cctv`, `/alarme`
12. Cofre com inventário interativo e sistema de senha

## Observações

* Comandos disponíveis: `/mobilias`, `/cofre`, `/cctv`, `/alarme`.
* Todas as demais interações ocorrem via interface intuitiva.
* UI deve seguir boas práticas modernas: acessível, limpa, responsiva.
* Raycast obrigatório para ações com objetos físicos (cofre, câmera).

---

![UI Preview](https://i.imgur.com/Dbj0vwx.png)

*O sistema deve ser modular e facilmente extensível para futuras adições.*
