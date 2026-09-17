---
name: api-field-integration
description: "Localize campos, formulários, ações e telas do frontend que precisam de integração com a API; acesse e entenda o backend na pasta irmã back; encontre o endpoint real; conecte a implementação correta e valide que método, rota, parâmetros, payload e resposta acionam a função necessária. Audite regras de negócio, leia e registre erros em erros-logica. Use para corrigir links de API, endpoints, chamadas fetch/Axios, CRUD e integrações frontend-backend no Pollen Parque."
argument-hint: "Informe a tela, campo, ação ou fluxo que deve ser conectado à API."
user-invocable: true
---

# Integração de campos com a API

## Objetivo

Garantir que cada campo ou ação do frontend esteja ligado ao endpoint correto do backend, sem inventar rotas. O trabalho deve terminar com uma evidência de que a chamada alcança a função necessária e trata sua resposta e seus erros.

## Quando usar

- Um campo, formulário, botão ou tela ainda usa mock, valor estático ou chamada incorreta.
- Uma integração usa URL, método HTTP, parâmetros ou payload suspeitos.
- É necessário conectar um CRUD do frontend a uma rota existente.
- A tela apresenta dados errados, não persiste alterações ou chama uma função diferente da esperada.
- É preciso verificar se uma chamada de API realmente executa a função correspondente no backend.

## Regras

- Comece pelo arquivo, componente, campo ou ação citada pelo usuário e siga o fluxo local até a camada de API.
- O frontend fica em `front` e o backend deste projeto fica na pasta irmã `../back` (normalmente `/home/crs/semanaia/back`). Acesse essa pasta quando precisar confirmar o contrato ou o comportamento da API.
- Procure a implementação real da rota no backend, seus schemas, controladores, serviços e testes. Quando o backend estiver em outro diretório, repositório ou indisponível, declare essa limitação.
- Não invente endpoints, métodos, nomes de campos, tokens, credenciais ou contratos de resposta.
- Preserve alterações existentes e mantenha a solução compatível com os padrões do projeto, como o cliente HTTP centralizado em `src/services/api.js`.
- Não substitua uma integração funcional por mock. Mock só pode ser usado quando a ausência do backend for explícita e documentada.
- Não exponha dados pessoais, financeiros, tokens ou credenciais em logs, fixtures, testes ou mensagens.
- Ao encontrar uma regra de negócio inconsistente, registre o problema em `erros-logica/` antes de ajustar o sistema.
- Leia os relatórios existentes em `front/erros-logica/` antes da análise e use suas informações para orientar e validar a correção.

## Procedimento

1. **Defina o alvo**
   - Identifique a tela, componente, campo, botão, evento ou fluxo informado.
   - Localize o estado que alimenta o campo e o handler que lê, grava ou envia seu valor.
   - Registre qual comportamento está faltando ou incorreto.

2. **Rastreie a chamada atual**
   - Siga o caminho `campo/tela -> evento ou submit -> função do componente -> serviço HTTP -> URL final`.
   - Verifique se a chamada é feita via cliente centralizado ou se há uma URL direta duplicada.
   - Confirme onde estão tratados carregamento, sucesso, vazio, erro e validação.

3. **Entenda o backend fora da pasta frontend**
   - A partir de `front`, inspecione `../back/README.md`, `../back/package.json` e a árvore `../back/src/`.
   - Localize o registro da rota em `../back/src/routes/` e siga a cadeia até `controllers/`, `models/`, `plugins/` ou outras funções chamadas.
   - Consulte `../back/test/` e o schema ou migrações disponíveis para confirmar casos de sucesso, erros e formato dos dados.
   - Verifique a inicialização em `../back/src/app.js` e `../back/src/server.js`, incluindo prefixo `/api`, autenticação, porta e plugins relevantes.

4. **Encontre o contrato real**
   - Pesquise no backend por método e caminho, nome da função, entidade e campos do payload.
   - Confirme, nesta ordem: método HTTP, caminho, parâmetros de rota/query, headers/autenticação, formato do body, resposta e códigos de erro.
   - Se houver mais de uma rota plausível, compare o uso da função no backend e os testes antes de escolher.
   - Se só existir documentação ou um serviço mock, marque a integração como não confirmada e não a apresente como concluída.

5. **Audite as regras de negócio**
   - Procure regras no controller, serviços, schemas, models, validações, permissões e testes do backend, considerando estados, transições, obrigatoriedade, valores, datas e relacionamentos.
   - Compare essas regras com o comportamento esperado no frontend e com os relatórios já existentes em `front/erros-logica/`.
   - Diferencie erro confirmado, comportamento apenas não documentado e limitação de ambiente. Não registre suposições como defeitos.
   - Para cada erro confirmado, crie ou atualize `front/erros-logica/regras-negocio.md` com: data, arquivo/rota afetada, regra esperada, comportamento encontrado, evidência, impacto, correção aplicada ou recomendada e validação pendente.
   - Não inclua tokens, credenciais ou dados pessoais/reais no relatório. Se a pasta ou arquivo ainda não existir, crie a pasta `erros-logica/` e o arquivo `regras-negocio.md`.

6. **Faça a menor correção**
   - Ajuste primeiro o serviço ou cliente de API para refletir o contrato real.
   - Atualize o componente apenas para enviar os valores corretos e refletir a resposta recebida.
   - Preserve nomes públicos e tipos já usados, salvo quando o contrato exigir a mudança.
   - Remova valores hardcoded ou mocks somente quando houver uma fonte real para substituí-los.
   - Quando o erro estiver no backend, corrija a regra na camada que realmente a controla e atualize o frontend apenas para refletir o contrato corrigido.
   - Quando o backend não puder ser alterado, adapte o frontend somente com uma decisão explícita e registre a limitação no relatório.

7. **Verifique a ligação ponta a ponta**
   - Rode o teste mais estreito disponível para o fluxo.
   - Para o backend, priorize `npm test` executado dentro de `../back` ou um teste específico do arquivo afetado; confirme que o teste chega ao controller ou função esperada, e não apenas que a rota responde.
   - Na ausência de teste automatizado, execute uma validação controlada: cliente HTTP mockado verificando método, URL, payload e tratamento da resposta, ou chamada contra backend local com dados não sensíveis. Se iniciar a API, use `../back` e a porta documentada, normalmente `3333`.
   - Confirme que a rota alcança a função necessária no backend e que o frontend atualiza seu estado após sucesso e exibe erro sem mascará-lo.
   - Para alterações no frontend, rode `npm run lint` e `npm run build` conforme aplicável; para alterações no backend, rode os scripts definidos em `../back/package.json`.

8. **Revise o resultado**
   - Procure chamadas duplicadas, URLs antigas, campos divergentes e referências ao mock substituído.
   - Verifique estados de carregamento, erro, vazio e sucesso, além de responsividade quando a mudança for visual.
   - Releia `front/erros-logica/regras-negocio.md` e marque cada item como corrigido, pendente ou não confirmado, sempre com a validação correspondente.
   - Não considere concluído um endpoint que apenas retorna `200` sem demonstrar que executa a operação esperada.

## Critérios de conclusão

Considere a tarefa concluída somente quando:

- o campo ou ação aponta para o serviço correto;
- o serviço usa método, rota, parâmetros e payload confirmados;
- a rota foi rastreada em `../back` até o controller, serviço ou função efetivamente responsável;
- a resposta é mapeada para o estado esperado da tela;
- as regras de negócio foram comparadas com o backend e os relatórios de `erros-logica/`;
- erros e carregamento são tratados sem esconder falhas;
- cada erro de regra confirmado foi registrado em `front/erros-logica/regras-negocio.md`;
- existe uma validação executada ou uma limitação objetiva documentada;
- não foram inventadas rotas ou credenciais.

## Relato final

Responda em português do Brasil com:

- resultado implementado;
- arquivos alterados;
- cadeia validada (`campo -> handler -> serviço -> endpoint -> função backend`);
- regras de negócio verificadas e referência ao relatório em `erros-logica/`;
- validações executadas e resultado;
- limitações ou contratos ainda não confirmados;
- próximo passo apenas se houver uma pendência concreta.
