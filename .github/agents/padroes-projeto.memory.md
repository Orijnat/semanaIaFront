# Memória: Padrões de Projeto React Node Tailwind

## Escopo
Agente responsável por arquitetura, estrutura de pastas, componentes, limites entre camadas, React/Next.js, Node.js, Tailwind, qualidade e manutenção.

## Histórico

### 2026-09-15
- Dashboard inicial revisado para separar dados mockados e configuração de filtros do componente visual.
- Criado `src/app/dashboard-data.js` para concentrar afiliadas, etapas e filtros.
- Mantida a lógica local de busca e filtros sem criação de backend ou endpoints.
- Estrutura de páginas e componentes foi organizada antes deste registro: shell compartilhado, páginas por rota e componentes reutilizáveis.
- Agente criado com regras para evitar abstrações especulativas e preservar limites entre apresentação, domínio e integração.

## Arquivos envolvidos
- `src/app/dashboard-data.js`
- `src/app/page.jsx`
- `src/components/DashboardPage.jsx`
- `src/components/AppShell.jsx`
- `src/components/AffiliatesTable.jsx`
- `.github/agents/padroes-projeto.agent.md`

## Validações registradas
- `npm run lint`
- `npm run build`

## Pendências
- Criar camada de serviços e modelos quando houver backend real.
- Definir contratos de domínio antes de substituir os mocks.
- Evitar novas abstrações até que exista duplicação ou complexidade comprovada.
