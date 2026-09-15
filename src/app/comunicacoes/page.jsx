import SectionPage from "../../components/SectionPage";

export default function ComunicacoesPage() {
  return <SectionPage activePage="comunicacoes" title="Comunicações" eyebrow="HISTÓRICO DE COMUNICAÇÕES" description="Registre destinatários, assuntos, status e resumos dos contatos institucionais." items={[["Aguardando retorno", "4 comunicações em andamento", "↗"], ["Últimas mensagens", "Histórico por empresa e processo", "□"], ["Novo registro", "A integração de e-mail ainda não está ativa", "+"]].map(([title, description, icon]) => ({ title, description, icon }))} />;
}
