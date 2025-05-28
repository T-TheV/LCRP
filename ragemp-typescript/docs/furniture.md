# 🛋️ Sistema de Mobílias - RageMP + TypeScript

Sistema modular e avançado de mobílias para servidores Roleplay, criado sobre o boilerplate [leonardssh/ragemp-typescript](https://github.com/leonardssh/ragemp-typescript). Permite que jogadores personalizem propriedades com mobílias físicas do GTA V, com controle completo via interface gráfica moderna (CEF) e comando único `/mobilias`.



## 🚀 Funcionalidades

- Catálogo pré-definido com nomes amigáveis e categorias
- Posicionamento preciso com teclas ou mouse (alternável)
- Rotação nos eixos, clonagem rápida, modo edição
- Contorno visual de seleção (vermelho)
- Salvar até **5 estados diferentes** por propriedade
- Edição com freeze e câmera livre
- Limites de mobílias por tipo de jogador (Prata, Gold, etc.)
- Persistência total no banco de dados
- Sincronização com `virtualWorld`
- Interface 100% em HTML, CSS, JS e TypeScript
- Logs de ações e permissões granulares por propriedade
- Comando único: `/mobilias`

---

## 📁 Estrutura de Arquivos

```bash
src/
├── server/
│ └── modules/
│ └── mobilia/
│ ├── commands/mobilia.commands.ts
│ ├── controller/mobilia.controller.ts
│ ├── data/catalogo.ts
│ ├── events/mobilia.events.ts
│ ├── types/mobilia.types.ts
│ └── index.ts
├── client/
│ └── modules/
│ └── mobilia/
│ ├── events/mobilia.client.ts
│ └── index.ts
├── cef/
│ └── mobilias/
│ ├── index.html
│ ├── style.css
│ └── app.ts

```

## 🧠 Lógica de Acesso

| Acesso                      | Descrição |
|----------------------------|-----------|
| **Dono da propriedade**     | Acesso total ao `/mobilias` |
| **Usuários autorizados**    | Podem editar se liberados via menu |
| **Administradores**         | Têm acesso total a qualquer `/mobilias` |
| **Propriedades**            | Cada mobília pertence a uma propriedade e respeita seu `virtualWorld` |

---

## 💾 Limites por Jogador

| Tipo         | Limite de mobílias |
|--------------|--------------------|
| Prata        | 200                |
| Gold         | 400                |
| Platinum     | 800                |
| BonusMobília | +1200 extras       |

---

## 🔧 Comando Único

```text
/mobilias

Abre a interface de gerenciamento, que permite:

Adicionar mobília do catálogo

Editar, mover, rotacionar, clonar

Remover mobília

Gerenciar permissões de edição

Alternar entre estados salvos

Resetar todas as mobílias da propriedade
```
---

## 📦 Exemplo de Catálogo

```export const catalogoMobilias = [
  {
    id: 'sofa_couro_01',
    nome: 'Sofá de Couro',
    modelo: 'prop_ld_farm_chair01',
    categoria: 'Sofás'
  },
  {
    id: 'mesa_madeira',
    nome: 'Mesa de Madeira',
    modelo: 'prop_table_04',
    categoria: 'Mesas'
  }
];
```

---

## 📌 Observações

Mobílias são físicas (possuem colisão)

Nenhuma interação avançada (sem sentar, ligar, etc.)

O sistema é modular e expansível

Toda lógica de UI está isolada no CEF```

---

##  🧩 Requisitos
```
RageMP Server com suporte a CEF

Boilerplate: leonardssh/ragemp-typescript

Banco de dados relacional (MySQL/PostgreSQL)

```



