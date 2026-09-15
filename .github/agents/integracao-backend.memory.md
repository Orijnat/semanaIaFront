# Memória: Integração Backend Pollen Parque

## Escopo
Agente responsável pelos vínculos entre frontend e rotas backend: clientes HTTP, serviços, contratos, autenticação, CRUD remoto, erros, retries e mocks.

## Histórico

### 2026-09-15
- Agente criado para orientar a futura integração do frontend com APIs do Pollen Parque.
- Nenhum endpoint, cliente HTTP, contrato, credencial ou integração de backend foi implementado até o momento.
- O projeto permanece com dados mockados e estado em memória.
- Regra registrada: não inventar rotas, campos, status, credenciais ou regras financeiras sem contrato real.
- Regra registrada: diferenciar erros de validação, autenticação, autorização, conflito, não encontrado e falha de servidor quando a integração existir.

## Arquivos envolvidos
- `.github/agents/integracao-backend.agent.md`
- `README.md` registra a ausência atual de backend e persistência.

## Validações registradas
- A criação do agente foi conferida pelo frontmatter e pela presença em `.github/agents`.
- O projeto existente passou anteriormente por `npm run lint` e `npm run build`.

## Pendências
- Receber documentação ou código do backend.
- Definir autenticação, autorização, endpoints, schemas, status HTTP e paginação server-side.
- Substituir mocks por serviços por domínio somente após os contratos serem confirmados.
