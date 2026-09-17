# Pollen Parque: frontend
Protótipo web do painel de gestão do programa de afiliados Pollen Parque. A interface organiza a visão geral do programa, a base de afiliadas, documentos, financeiro e histórico de comunicações em uma navegação única. O projeto é um frontend demonstrativo: os dados e alterações ficam somente em memória no navegador.
## Pré-requisitos e instalação
- Node.js com npm instalado. A versão do Node não é fixada neste repositório.
- Dependências instaladas com `npm install`.
```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador. Para executar a versão de produção localmente, rode `npm run build` e depois `npm run start`.
## Comandos npm
| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Next.js. |
| `npm run lint` | Executa o ESLint sobre o projeto. |
| `npm run build` | Gera a build de produção do Next.js. |
| `npm run start` | Inicia a aplicação a partir da build gerada. |
## Rotas atuais
As rotas usam o App Router e compartilham a navegação de [`AppShell`](src/components/AppShell.jsx).
| Rota | Página | Comportamento atual |
| --- | --- | --- |
| `/` | Visão geral | Dashboard com métricas fixas, etapas do pipeline, itens de atenção e afiliadas recentes. |
| `/visao-geral` | Visão geral | Exibe o mesmo dashboard da rota inicial. |
| `/pendencias/documentos` | Documentos pendentes | Lista empresas e documentos que precisam ser conferidos ou enviados. |
| `/pendencias/pagamentos` | Pagamentos próximos | Lista cobranças próximas do vencimento e notas relacionadas. |
| `/pendencias/procuradoria` | Retorno da Procuradoria | Lista contratos enviados, pendentes e concluídos. |
| `/afiliadas` | Afiliadas | Tabela com busca, filtros, criação, edição e exclusão local de afiliadas. |
| `/documentos` | Documentos | Lista indicadores mockados e permite cadastrar, editar e excluir registros genéricos de documento. |
| `/documentos/validade` | Validades próximas | Lista documentos próximos do vencimento. |
| `/documentos/historico` | Histórico de envios | Lista documentos enviados e seus registros de recebimento. |
| `/financeiro` | Financeiro | Exibe indicadores, permite cadastrar, editar e excluir lançamentos genéricos e possui área local para preparar o envio de notas fiscais de pagamento. |
| `/comunicacoes` | Comunicações | Lista indicadores mockados e permite cadastrar, editar e excluir registros de comunicação. |
| `/configuracoes` | Configurações | Lista indicadores mockados e permite cadastrar, editar e excluir configurações genéricas. |
Não há rota de login, formulário público de inscrição, detalhe de empresa ou área restrita por perfil implementados neste frontend.
## Componentes reutilizáveis
- [`AppShell`](src/components/AppShell.jsx): layout compartilhado com marca, navegação lateral, breadcrumb, notificações visuais e usuário estático.
- [`DashboardPage`](src/components/DashboardPage.jsx): dashboard do programa, usado por `/` e `/visao-geral`.
- [`AffiliatesTable`](src/components/AffiliatesTable.jsx): tabela de afiliadas com busca por empresa/responsável, filtros por etapa, paginação local e abertura do CRUD. Aceita `compact` para o título de empresas recentes.
- [`Pagination`](src/components/Pagination.jsx): controles reutilizáveis de paginação local, com página atual, total de páginas, navegação anterior/próxima e tamanho da página.
- [`SectionPage`](src/components/SectionPage.jsx): página genérica das seções de documentos, financeiro, comunicações e configurações. Recebe `activePage`, `title`, `eyebrow`, `description` e `items`.
- [`CrudModal`](src/components/CrudModal.jsx): modal controlado por propriedades para formulário de criação/edição. Recebe `title`, `fields`, `initialData`, `onClose`, `onSave` e, em edição, `onDelete`.
- [`affiliate-schema.js`](src/app/affiliate-schema.js): contrato visual normalizado para os campos da planilha, incluindo afiliada, contrato, cobrança, pagamento, vigência e entidades auxiliares.
## Comportamento do CRUD
O modal é usado para afiliadas e para as quatro páginas baseadas em `SectionPage`.
- Campos são gerados a partir de uma definição local e podem ser texto, `textarea` ou `select`.
- Campos são obrigatórios por padrão; `required: false` os torna opcionais. A submissão usa a validação nativa do navegador.
- `Salvar` cria um registro com identificador baseado em `Date.now()` ou substitui o registro editado.
- `Excluir` aparece somente ao editar um registro existente.
- O modal fecha pelo botão de fechar, por `Esc`, por clique no backdrop ou por `Cancelar`.
- A lista é atualizada com `useState`; não há confirmação adicional, persistência, upload ou chamada de API.
- As listas de afiliadas, notas fiscais e registros de `SectionPage` usam paginação local sobre os arrays em memória. Busca e filtros das afiliadas são aplicados antes da paginação, e mudanças nesses critérios retornam à primeira página; não há paginação de servidor nem parâmetros de API.

Na página Financeiro, o painel de notas permite selecionar empresa, competência, valor, número da nota e arquivo PDF/XML. A seleção local rejeita extensões fora de PDF/XML e arquivos acima de 10 MB. A nota é adicionada apenas à fila local do navegador e recebe status visual de `Aguardando envio`; não existe upload persistido ou transmissão para o backend.
## Dados e persistência
Os dados exibidos são mockados no código:
- [`dashboard-data.js`](src/app/dashboard-data.js) contém afiliadas, etapas do pipeline e filtros iniciais.
- As páginas de documentos, financeiro, comunicações e configurações definem seus próprios itens iniciais em arrays locais.
- Os registros são copiados para o estado React no carregamento e as inclusões, edições e exclusões existem somente enquanto a página/aplicação permanece aberta.
Não existe backend, banco de dados, `localStorage`, autenticação ou camada de API configurada. Recarregar a página perde as alterações e restaura os mocks.

## Mapeamento da planilha
O arquivo [`Planilhas controle de informações afiliados.xlsx`](Planilhas%20controle%20de%20informa%C3%A7%C3%B5es%20afiliados.xlsx) possui seis abas mapeadas para o frontend:

- `Benefícios Afiliadas`: número e benefício.
- `Controle marca da empresa telão`: empresa, exibição no telão, marca no site e observações.
- `Planilha reservas espaços físic`: empresa, CNPJ, reservas do Ático, Auditório e coworking, além das datas/observações.
- `Controle de contratos afiliadas`: dados cadastrais, representante, e-mail de boletos, contrato, valor, NF/boleto, vencimento, pagamento, cobrança seguinte, vigência, renovação e status.
- `Contato e envio de materiais do`: empresa e controle de materiais.
- `Mapeamento de prospecção de emp`: cidade, empresa, e-mail para materiais e telefone.

O frontend já consegue receber os campos da aba de contratos pelo contrato em [`affiliate-schema.js`](src/app/affiliate-schema.js). Os valores reais ainda deverão chegar por uma API; a planilha não é carregada automaticamente no navegador.
## Identidade visual e responsividade
O estilo está concentrado em [`globals.css`](src/app/globals.css). A interface usa uma direção visual clara e administrativa, com fundo `#fbfcfa`, verdes para navegação e estados positivos, laranja para atenção, painéis brancos, bordas suaves e cantos arredondados.
O corpo e os títulos usam `Roboto`, carregada via `next/font` em [`layout.js`](src/app/layout.js).
Há adaptações para telas menores: a barra lateral reduzida, filtros com rolagem horizontal, tabela com rolagem, grade de métricas em duas colunas e modal ancorado na parte inferior em telas estreitas.
## Estados e limitações atuais
Implementado:

- Estado vazio da tabela quando a busca ou filtro não encontra afiliadas.
- Estado local de abertura, edição e fechamento dos modais.
- Destaques visuais para etapas, pendências, pagamentos e status.
- Foco visível e navegação principal com `aria-label`, `aria-current` e diálogo modal.
Ainda não implementado:

- Estados de carregamento, erro de requisição e sucesso vindo de servidor.
- Login, autorização e isolamento de dados por perfil.
- Upload/listagem real de documentos e notas fiscais, geração de termos e integração com a Procuradoria.
- Registro financeiro com NF, boleto, vencimento e confirmação persistidos.
- Envio real ou sincronização de e-mails.
- Auditoria, renovação, notificações funcionais e exportação. O botão `Exportar` é apenas visual.
## Integração backend pendente
O frontend ainda precisa de uma decisão e de contratos de backend para substituir os mocks. A integração deverá definir, no mínimo, autenticação e perfis, empresas e etapas do processo, documentos, contratos, lançamentos financeiros, comunicações, auditoria e permissões por afiliada. Nenhum endpoint, credencial ou regra financeira é assumido por este protótipo.
## Validação
Para validar a instalação e a documentação junto com o projeto:
```bash
npm run lint
npm run build
```

Também é possível iniciar a aplicação com `npm run dev` e conferir as rotas listadas acima no navegador. Este README descreve o estado atual do código; mudanças de rotas, scripts, props ou integrações devem ser refletidas aqui.
