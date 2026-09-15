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
| `/afiliadas` | Afiliadas | Tabela com busca, filtros, criação, edição e exclusão local de afiliadas. |
| `/documentos` | Documentos | Lista indicadores mockados e permite cadastrar, editar e excluir registros genéricos de documento. |
| `/financeiro` | Financeiro | Lista indicadores mockados e permite cadastrar, editar e excluir lançamentos genéricos. |
| `/comunicacoes` | Comunicações | Lista indicadores mockados e permite cadastrar, editar e excluir registros de comunicação. |
| `/configuracoes` | Configurações | Lista indicadores mockados e permite cadastrar, editar e excluir configurações genéricas. |
Não há rota de login, formulário público de inscrição, detalhe de empresa ou área restrita por perfil implementados neste frontend.
## Componentes reutilizáveis
- [`AppShell`](src/components/AppShell.jsx): layout compartilhado com marca, navegação lateral, breadcrumb, notificações visuais e usuário estático.
- [`DashboardPage`](src/components/DashboardPage.jsx): dashboard do programa, usado por `/` e `/visao-geral`.
- [`AffiliatesTable`](src/components/AffiliatesTable.jsx): tabela de afiliadas com busca por empresa/responsável, filtros por etapa e abertura do CRUD. Aceita `compact` para o título de empresas recentes.
- [`SectionPage`](src/components/SectionPage.jsx): página genérica das seções de documentos, financeiro, comunicações e configurações. Recebe `activePage`, `title`, `eyebrow`, `description` e `items`.
- [`CrudModal`](src/components/CrudModal.jsx): modal controlado por propriedades para formulário de criação/edição. Recebe `title`, `fields`, `initialData`, `onClose`, `onSave` e, em edição, `onDelete`.
## Comportamento do CRUD
O modal é usado para afiliadas e para as quatro páginas baseadas em `SectionPage`.
- Campos são gerados a partir de uma definição local e podem ser texto, `textarea` ou `select`.
- Campos são obrigatórios por padrão; `required: false` os torna opcionais. A submissão usa a validação nativa do navegador.
- `Salvar` cria um registro com identificador baseado em `Date.now()` ou substitui o registro editado.
- `Excluir` aparece somente ao editar um registro existente.
- O modal fecha pelo botão de fechar, por `Esc`, por clique no backdrop ou por `Cancelar`.
- A lista é atualizada com `useState`; não há confirmação adicional, persistência, upload ou chamada de API.
## Dados e persistência
Os dados exibidos são mockados no código:
- [`dashboard-data.js`](src/app/dashboard-data.js) contém afiliadas, etapas do pipeline e filtros iniciais.
- As páginas de documentos, financeiro, comunicações e configurações definem seus próprios itens iniciais em arrays locais.
- Os registros são copiados para o estado React no carregamento e as inclusões, edições e exclusões existem somente enquanto a página/aplicação permanece aberta.
Não existe backend, banco de dados, `localStorage`, autenticação ou camada de API configurada. Recarregar a página perde as alterações e restaura os mocks.
## Identidade visual e responsividade
O estilo está concentrado em [`globals.css`](src/app/globals.css). A interface usa uma direção visual clara e administrativa, com fundo `#fbfcfa`, verdes para navegação e estados positivos, laranja para atenção, painéis brancos, bordas suaves e cantos arredondados.
O corpo usa `Plus Jakarta Sans` e títulos usam `Space Grotesk`, carregados via Google Fonts no CSS. O layout também carrega `Geist` e `Geist Mono` com `next/font` em [`layout.js`](src/app/layout.js), disponibilizando as variáveis de fonte, embora os estilos atuais priorizem as fontes definidas em `globals.css`.
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
- Upload/listagem real de documentos, geração de termos e integração com a Procuradoria.
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
