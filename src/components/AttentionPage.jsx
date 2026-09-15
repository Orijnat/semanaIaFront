import Link from "next/link";
import AppShell from "./AppShell";

const attentionData = {
  documentos: {
    activePage: "documentos",
    title: "Documentos pendentes",
    eyebrow: "PARA HOJE / DOCUMENTOS",
    description: "Confira quais empresas ainda precisam enviar documentos para avançar no processo.",
    icon: "!",
    items: [
      ["Bioma Circular", "Contrato social e comprovante de endereço", "Vence em 2 dias", "urgent"],
      ["Nexora Tecnologia", "Certidão negativa de débitos", "Aguardando envio", "waiting"],
      ["Cais Internacional", "Documento de identificação do responsável", "Aguardando conferência", "waiting"],
    ],
  },
  pagamentos: {
    activePage: "financeiro",
    title: "Pagamentos próximos",
    eyebrow: "PARA HOJE / FINANCEIRO",
    description: "Acompanhe as cobranças que se aproximam do vencimento e confira seus documentos fiscais.",
    icon: "$",
    items: [
      ["Atlas Mobilidade", "Boleto da competência 09/2026 · R$ 2.200,00", "Vence em 3 dias", "urgent"],
      ["Cais Internacional", "Boleto da competência 09/2026 · R$ 2.200,00", "Vence em 7 dias", "waiting"],
      ["Verde Norte Energia", "Nota fiscal NF 00482 · R$ 2.200,00", "Nota conferida", "done"],
    ],
  },
  procuradoria: {
    activePage: "visao-geral",
    title: "Retorno da Procuradoria",
    eyebrow: "PARA HOJE / CONTRATOS",
    description: "Consulte contratos enviados e registre o andamento do retorno da Procuradoria Jurídica.",
    icon: "✓",
    items: [
      ["Atlas Mobilidade", "Contrato v2 enviado em 12/09/2026", "Aguardando retorno", "waiting"],
      ["Bioma Circular", "Termo em preparação para envio", "Próxima ação: enviar", "urgent"],
      ["Verde Norte Energia", "Contrato assinado e arquivado", "Concluído", "done"],
    ],
  },
};

export default function AttentionPage({ type }) {
  const page = attentionData[type];

  return <AppShell activePage={page.activePage} breadcrumb={page.title}><div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p className="subheading">{page.description}</p></div><Link className="secondary-button attention-back" href="/">← Voltar ao dashboard</Link></section><section className="panel attention-page-panel"><div className="panel-heading"><div><p className="eyebrow">ITENS PARA CONFERIR</p><h2>{page.items.length} registros encontrados</h2></div><span className="attention-badge">Mock local</span></div><div className="attention-page-list">{page.items.map(([company, detail, status, statusClass]) => <article className="attention-page-item" key={`${company}-${detail}`}><span className={`attention-icon ${type === "pagamentos" ? "blue" : type === "procuradoria" ? "green" : "orange"}`}>{page.icon}</span><div><strong>{company}</strong><small>{detail}</small></div><span className={`attention-page-status ${statusClass}`}>{status}</span><button className="row-action" type="button" aria-label={`Abrir item de ${company}`}>→</button></article>)}</div></section></div></AppShell>;
}
