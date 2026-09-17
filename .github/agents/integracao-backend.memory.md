# Memória: Integração Backend Pollen Parque

## Escopo
Agente responsável pelos vínculos entre frontend e rotas backend: clientes HTTP, serviços, contratos, autenticação, CRUD remoto, erros, retries e mocks.

## Histórico

### 2026-09-15
- Agente criado para orientar a integração do frontend com APIs do Pollen Parque.
- Criada camada de serviço HTTP em `src/services/api.js` usando Axios com suporte a autenticação Bearer JWT e fallback configurável por `NEXT_PUBLIC_API_URL`.
- Mapeados serviços para `auth`, `companies`, `finance`, `documents` e `emails` alinhados com o backend Fastify.
- Regra registrada: manter tolerância e dados mockados para desenvolvimento local enquanto o backend não estiver ativo.

## Arquivos envolvidos
- `.github/agents/integracao-backend.agent.md`
- `src/services/api.js`
- `README.md`

## Validações registradas
- `npm run build` no frontend concluído com sucesso com a nova camada de serviços.

## Pendências
- Conectar as telas e formulários aos métodos da API em `src/services/api.js` conforme necessidade de persistência remota.
- Adicionar tratamento de toast/notificação global de erros HTTP.
