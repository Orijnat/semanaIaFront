# Memória: Documentação Frontend Pollen Parque

## Escopo
Agente responsável por README, rotas, componentes, fluxos, dados mockados, contratos esperados, setup, limitações e guias do frontend.

## Histórico

### 2026-09-15
- README principal criado e atualizado para documentar instalação, scripts, rotas, componentes e validações.
- Documentados os modais CRUD, seu comportamento local e a ausência de persistência.
- Documentadas as fontes, identidade visual, responsividade e estados atuais.
- Registrada a área de notas fiscais no Financeiro como preparação local, sem upload persistido.
- Registradas as páginas de pendências: documentos, pagamentos e retorno da Procuradoria.
- Registrada a paginação local de afiliadas, notas e listas de `SectionPage`.
- Mantida a distinção entre protótipo/mock e integração backend futura.

## Arquivos envolvidos
- `README.md`
- `src/app/*/page.jsx`
- `src/components/*.jsx`
- `src/app/dashboard-data.js`
- `.github/agents/documentacao-frontend.agent.md`

## Validações registradas
- `npm run lint`
- `npm run build`
- Verificação de links locais e fences Markdown no README.
- `git diff --check`

## Pendências
- Atualizar o README quando rotas, props, scripts ou contratos mudarem.
- Documentar o backend somente após seus contratos serem confirmados.
- Não descrever upload, persistência, autenticação ou envio de e-mail como implementados enquanto continuarem mockados.
