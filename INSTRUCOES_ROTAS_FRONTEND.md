# Instruções de Integração de Rotas Frontend (V2 — Pollen Parque)

**Destinatário:** Agente Desenvolvedor Frontend  
**Origem:** Agente Orquestrador SDLC / Backend  
**Data:** 18 de Setembro de 2026  
**Status do Backend:** 100% IMPLEMENTADO, TESTADO E OPERACIONAL  

---

## 1. Contexto e Objetivos

O Backend do Pollen Parque concluiu com sucesso a implementação dos requisitos da versão V2:
1. **Substituição do Formulário PDF Manual (`dasd.pdf`):** Rotas de autoatendimento para empresas não-residentes disponíveis e testadas.
2. **Geração Automatizada de Minutas em PDF:** Geração nativa com LibreOffice a partir do template `.docx` oficial e preenchimento integral de todas as variáveis, com fallback resiliente para `.docx` e registro automático na tabela de anexos (`documentos_anexos`).
3. **Compatibilidade de Rotas e Aliases:** Disponibilização de rotas espelhadas em inglês e português, além de suporte flexível a payloads em `camelCase` ou `snake_case`.

Este documento orienta os componentes e rotas que o agente de frontend deve construir ou atualizar na interface.

---

## 2. Endpoints Backend Prontos para Consumo

A URL base configurada é `http://localhost:3002/api/v1` (ou `http://localhost:3001/api/v1` conforme o `.env`).

| Finalidade | Método HTTP | Endpoints Equivalentes (Aliases) | Autenticação |
| :--- | :--- | :--- | :--- |
| **Inscrição Não-Residente** | `POST` | `/api/v1/companies/nao-residente`<br>`/api/v1/empresas/nao-residente`<br>`/api/v1/public/nao-residente` | Pública (dispensa token) |
| **Geração de Minuta Contratual** | `POST` | `/api/v1/companies/:id/contract/generate`<br>`/api/v1/empresas/:id/contract/generate` | Autenticada |
| **Consulta de Anexos da Empresa** | `GET` | `/api/v1/companies/:id/documents`<br>`/api/v1/empresas/:id/documents` | Autenticada |
| **Serviço de Arquivos Estáticos** | `GET` | `http://localhost:3002/uploads/contratos/[nome_do_arquivo]` | Pública / Download |

---

## 3. Tarefas a Implementar no Frontend

### Tarefa 1: Criar Página Pública de Autoatendimento Não-Residente
- **Rota sugerida no Next.js:** `src/app/inscricao/page.jsx` ou `src/app/cadastro-nao-residente/page.jsx`.
- **Objetivo:** Substituir o formulário PDF `dasd.pdf` por uma página web moderna e responsiva.
- **Campos do Formulário (16 campos organizados em etapas ou seções):**
  1. **Dados da Empresa (Pessoa Jurídica):**
     - `razaoSocial` (Texto, obrigatório)
     - `nomeFantasia` (Texto)
     - `cnpj` (Texto com máscara `00.000.000/0000-00`, obrigatório)
     - `anoFundacao` (Número)
     - `areaAtuacao` (Texto ou Select de segmentos)
     - `emailContato` (E-mail corporativo, obrigatório)
     - `emailCobranca` (E-mail para envio da NF e Boleto da anuidade)
     - `telefone` (Telefone/WhatsApp da empresa com máscara)
     - `site` (Site institucional ou rede social)
     - `enderecoCompleto` (Logradouro, número, complemento e bairro)
     - `cidade` (Texto, default "Chapecó")
     - `estado` (UF, 2 letras, default "SC")
     - `cep` (Máscara `00000-000`)
  2. **Dados do Representante Legal:**
     - `representanteNome` (Nome completo, obrigatório)
     - `representanteCpf` (CPF com máscara `000.000.000-00`, obrigatório)
     - `representanteCargo` (Cargo/Função, ex: Diretor, CEO, Sócio-Administrador)
     - `representanteEndereco` (Endereço residencial completo)
     - `representanteEmail` (E-mail pessoal/direto)
     - `representanteTelefone` (Celular/WhatsApp pessoal)
- **Integração:**
  Chamar `api.public.registerNonResident(formData)` ou `api.companies.registerNonResident(formData)`.
- **Feedback:**
  Exibir tela de sucesso com número de protocolo (gerado ou baseado no ID retornado) e orientações dos próximos passos.

---

### Tarefa 2: Implementar Visualizador Híbrido de Minutas (PDF vs Markdown)
- **Local:** No modal ou tela de visualização de contrato (ex: `src/components/ContractModal.jsx` ou na tela de detalhes da empresa).
- **Como Detectar o Formato:**
  ```javascript
  import { getStaticUrl } from '@/services/api';

  const isPdf = contrato?.conteudoGerado?.startsWith('[PDF GERADO]');
  
  if (isPdf) {
    const rawPath = contrato.conteudoGerado.replace('[PDF GERADO]', '').trim();
    const fileUrl = getStaticUrl(rawPath);
    const isDocx = rawPath.endsWith('.docx');

    return (
      <div className="flex flex-col gap-4">
        {isDocx ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
            <p className="font-medium">Minuta gerada no formato DOCX.</p>
            <p className="text-sm">O visualizador embutido requer formato PDF. Faça o download para abrir no Word ou LibreOffice.</p>
          </div>
        ) : (
          <div className="w-full h-[600px] border border-slate-300 rounded-lg overflow-hidden bg-slate-100">
            <iframe
              src={fileUrl}
              title="Visualização da Minuta Contratual em PDF"
              className="w-full h-full"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium inline-flex items-center gap-2"
          >
            Baixar Minuta Contratual ({isDocx ? 'DOCX' : 'PDF'})
          </a>
        </div>
      </div>
    );
  } else {
    // Renderização clássica em Markdown formatado para residentes
    return <div className="prose max-w-none">{contrato?.conteudoGerado}</div>;
  }
  ```

---

### Tarefa 3: Ficha Detalhada 360° da Empresa
- **Objetivo:** Substituir a abertura apenas do modal genérico de edição pela ficha técnica completa ao clicar em uma empresa na tabela.
- **Seções Recomendadas:**
  1. **Cabeçalho:** Razão Social, Nome Fantasia, Tag "Residente" vs "Não-Residente / Externa", Badge do Status Atual (`EM_ANALISE`, `MINUTA_GERADA`, etc.).
  2. **Pipeline de Progresso:** Barra visual demonstrando a etapa atual da empresa.
  3. **Aba Minuta Contratual:** Botão "Gerar Minuta" (chamando `api.companies.generateContract(id)`), seguido do visualizador híbrido PDF/MD.
  4. **Aba Signatários:** Checklist dos 5 signatários oficiais (Representante Legal, Diretoria, Parcerias, Procuradoria e Reitoria) com botão para registrar assinatura.
  5. **Aba Documentos:** Listagem dos documentos anexos (incluindo a minuta gerada com tipo `MINUTA_ASSINADA`), upload de novos documentos e aprovação/rejeição.
  6. **Aba Financeiro:** Faturas, boletos e confirmação de baixa.

---

### Tarefa 4: Disponibilização do Contrato no Portal da Afiliada (`/portal-empresa`)
- **Arquivo:** `src/app/portal-empresa/page.jsx` ou componente `CompanyPortalPage.jsx`.
- **Ajuste:** Na seção de contratos e documentos, adicionar o botão para baixar a minuta PDF preenchida gerada para a empresa autenticada.

---

## 4. Métodos do Cliente de API Atualizados em `src/services/api.js`

O arquivo `src/services/api.js` já foi atualizado com os seguintes métodos prontos para uso:

```javascript
// 1. Resolver URL completa de arquivos estáticos (PDFs e DOCXs em uploads/)
import { getStaticUrl, api } from '@/services/api';
const fullPdfUrl = getStaticUrl(contrato.conteudoGerado.replace('[PDF GERADO]', '').trim());

// 2. Cadastro de Empresa Não-Residente (16 campos)
await api.public.registerNonResident(payload);
// ou
await api.companies.registerNonResident(payload);

// 3. Geração de Minuta Contratual (híbrido PDF/MD)
const result = await api.companies.generateContract(companyId, { valorAnuidade: 3600 });
```

Tudo pronto no Backend. Boa implementação no Frontend!

