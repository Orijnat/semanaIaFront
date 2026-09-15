import SectionPage from "../../components/SectionPage";

export default function DocumentosPage() {
  return <SectionPage activePage="documentos" title="Documentos" eyebrow="CENTRAL DE DOCUMENTOS" description="Organize documentos enviados, pendências e validades das empresas afiliadas." items={[["Documentos pendentes", "5 empresas aguardam envio", "!", "/pendencias/documentos"], ["Validades próximas", "2 documentos vencem este mês", "⌁", "/documentos/validade"], ["Histórico de envios", "Consulte alterações e responsáveis", "✓", "/documentos/historico"]].map(([title, description, icon, href]) => ({ title, description, icon, href }))} />;
}
