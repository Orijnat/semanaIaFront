import SectionPage from "../../components/SectionPage";

export default function FinanceiroPage() {
  return <SectionPage activePage="financeiro" title="Financeiro" eyebrow="CONTROLE FINANCEIRO" description="Acompanhe notas fiscais, boletos, vencimentos e confirmações de pagamento." items={[["A receber", "R$ 48.600 em cobranças abertas", "$"], ["Vencimentos próximos", "3 cobranças vencem esta semana", "!"], ["Pagamentos confirmados", "22 afiliadas ativas", "✓"]].map(([title, description, icon]) => ({ title, description, icon }))} />;
}
