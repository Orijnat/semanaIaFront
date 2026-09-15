import Link from "next/link";
import AppShell from "./AppShell";

const documentViews = {
  validade: {
    title: "Validades próximas",
    eyebrow: "DOCUMENTOS / VALIDADES",
    description: "Acompanhe documentos que precisam ser renovados nos próximos dias.",
    badge: "2 próximos",
    items: [["Bioma Circular", "Certidão negativa de débitos", "Vence em 12 dias", "urgent"], ["Cais Internacional", "Documento do responsável legal", "Vence em 24 dias", "waiting"]],
  },
  historico: {
    title: "Histórico de envios",
    eyebrow: "DOCUMENTOS / HISTÓRICO",
    description: "Consulte os documentos enviados, responsáveis e datas de recebimento.",
    badge: "5 registros",
    items: [["Verde Norte Energia", "Contrato social · recebido por Joana Silva", "10/09/2026", "done"], ["Atlas Mobilidade", "Comprovante de endereço · recebido por equipe", "08/09/2026", "done"], ["Nexora Tecnologia", "Certidão negativa · aguardando conferência", "06/09/2026", "waiting"]],
  },
};

export default function DocumentTypePage({ view }) {
  const page = documentViews[view];
  return <AppShell activePage="documentos" breadcrumb={page.title}><div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p className="subheading">{page.description}</p></div><Link className="secondary-button attention-back" href="/documentos">← Todos os documentos</Link></section><section className="panel attention-page-panel"><div className="panel-heading"><div><p className="eyebrow">REGISTROS</p><h2>{page.items.length} itens encontrados</h2></div><span className="attention-badge">{page.badge}</span></div><div className="attention-page-list">{page.items.map(([company, detail, status, statusClass]) => <article className="attention-page-item" key={`${company}-${detail}`}><span className={`attention-icon ${statusClass === "urgent" ? "orange" : statusClass === "done" ? "green" : "blue"}`}>□</span><div><strong>{company}</strong><small>{detail}</small></div><span className={`attention-page-status ${statusClass}`}>{status}</span><button className="row-action" type="button" aria-label={`Abrir documento de ${company}`}>→</button></article>)}</div></section></div></AppShell>;
}
