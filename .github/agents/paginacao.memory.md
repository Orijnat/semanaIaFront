# Memória: Paginação Pollen Parque

## Escopo
Agente responsável por paginação local ou server-side, tamanho de página, filtros, busca, URL, estados vazios e controles acessíveis.

## Histórico

### 2026-09-15
- Auditoria realizada nas listas de afiliadas, notas fiscais e páginas genéricas.
- Auditoria inicial concluiu que o volume mockado não exigia paginação imediata, mas recomendou preparar o contrato para dados reais.
- Paginação local implementada após solicitação: criado `src/components/Pagination.jsx`.
- Paginação integrada a `AffiliatesTable`, `PaymentNotesPanel` e `SectionPage`.
- Busca e filtros de afiliadas são aplicados antes da paginação e retornam a lista para a primeira página quando mudam.
- Controles de anterior, próxima, página atual, total de páginas e tamanho da página adicionados.
- IDs estáveis adicionados aos mocks de afiliadas em `src/app/dashboard-data.js`.
- README atualizado para documentar que a paginação é local e não usa API.

## Arquivos envolvidos
- `src/components/Pagination.jsx`
- `src/components/AffiliatesTable.jsx`
- `src/components/PaymentNotesPanel.jsx`
- `src/components/SectionPage.jsx`
- `src/app/dashboard-data.js`
- `src/app/globals.css`
- `README.md`
- `.github/agents/paginacao.agent.md`

## Validações registradas
- `npm run lint`
- `npm run build`
- `git diff --check`

## Pendências
- Migrar para paginação no servidor quando houver API real.
- Definir contrato com `page`, `pageSize`, `total`, `items`, busca, filtros e ordenação.
- Persistir página e filtros na URL quando as rotas remotas forem implementadas.
