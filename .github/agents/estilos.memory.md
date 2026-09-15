# Memória: Estilos Pollen Parque

## Escopo
Agente responsável por UI/UX, CSS, Tailwind, responsividade, acessibilidade, interação, arquitetura de informação e consistência visual.

## Histórico

### 2026-09-15
- Direção visual inicial do Pollen Parque aplicada ao dashboard e às páginas internas.
- Interface refinada em `src/app/globals.css`: navegação lateral, cards, painéis, tabelas, filtros, busca, modais CRUD, estados vazios e responsividade.
- Foco de teclado, hover, estados ativos, `prefers-reduced-motion` e tooltips da navegação mobile adicionados ou aprimorados.
- Tipografia alterada para `Plus Jakarta Sans` no corpo e `Space Grotesk` em títulos, métricas, marca e modais.
- Área de notas fiscais recebeu estilos responsivos para formulário, dropzone, histórico e status.
- Páginas de pendências receberam estilos para listas de conferência, status e navegação de retorno.
- Escopo do agente ampliado para incluir UI/UX, fluxos, feedback, microcopy, prevenção de erros e avaliação heurística.

## Arquivos envolvidos
- `src/app/globals.css`
- `src/components/PaymentNotesPanel.jsx`
- `src/components/AttentionPage.jsx`
- `src/components/CrudModal.jsx`
- `.github/agents/estilos.agent.md`

## Validações registradas
- `npm run lint`
- `npm run build`
- `git diff --check`

## Pendências
- Validar visualmente em navegador real quando houver necessidade de inspeção por viewport.
- Não alterar regras de negócio ou contratos de backend sem solicitação específica.
