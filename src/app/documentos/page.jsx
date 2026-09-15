import SectionPage from "../../components/SectionPage";

export default function DocumentosPage() {
  return <SectionPage activePage="documentos" title="Documentos" eyebrow="CENTRAL DE DOCUMENTOS" description="Organize documentos enviados, pendências e validades das empresas afiliadas." items={[["Documentos pendentes", "5 empresas aguardam envio", "!"], ["Validades próximas", "2 documentos vencem este mês", "⌁"], ["Histórico de envios", "Consulte alterações e responsáveis", "✓"]].map(([title, description, icon]) => ({ title, description, icon }))} />;
}
