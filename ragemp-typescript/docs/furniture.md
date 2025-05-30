# Documentação Completa: Sistema de Arquitetura Integrado ao Furniture

## Visão Geral

Este documento define a especificação completa do sistema de Arquitetura para servidor RAGE.MP, integrando-se diretamente ao sistema de mobílias (Furniture) existente. O sistema está estruturado para trabalhar com raycasting, responsividade total com CEF, e modularização baseada no boilerplate do Leonardo (LeonardSSH).

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

1. Implementar comandos `/mobilias`, `/cofre`, `/cctv`, `/alarme`
2. Criar UI moderna com todas as 7 abas funcionais
3. Raycast de seleção de mobília com mini HUD
4. Cofre com inventário interativo e sistema de senha
5. Sistema de compra de mobílias com preview e integração com saldo

### Prioridade Média

6. Estilos do arquiteto + presets de ambiente com zonas
7. Integração do alarme com efeitos visuais e som
8. Interface de câmeras com navegação
9. Sistema de portfólio do arquiteto e templates reaplicáveis

### Prioridade Baixa

10. Exportação de presets entre propriedades
11. Logs e segurança para admins

## Responsáveis por Tarefa

| Tarefa                                | Responsável        |
| ------------------------------------- | ------------------ |
| Comandos (`/mobilias`, `/cofre`, etc) | Backend Server Dev |
| UI (7 abas completas)                 | Frontend (CEF) Dev |
| Raycasting e HUD visual               | Client Dev         |
| Sistema de câmeras                    | Client Dev         |
| Integração com sistema de mobílias    | Fullstack          |
| Alarme sonoro/visual                  | Client Dev         |
| Cofre com senha e inventário          | Fullstack          |
| Sistema de compra de mobílias         | Frontend + Backend |
| Estilos/presets do arquiteto          | Fullstack          |
| Logs e segurança                      | Backend Dev        |

## Observações

* Comandos disponíveis: `/mobilias`, `/cofre`, `/cctv`, `/alarme`.
* Todas as demais interações ocorrem via interface intuitiva.
* UI deve seguir boas práticas modernas: acessível, limpa, responsiva.
* Raycast obrigatório para ações com objetos físicos (cofre, câmera).

---
[Imagem](https://imgur.com/Dbj0vwx.png) - Exemplo de UI com abas e raycast
* Sistema deve ser modular e facilmente extensível para futuras adições.