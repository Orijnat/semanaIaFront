import SectionPage from "../../components/SectionPage";

export default function ConfiguracoesPage() {
  return <SectionPage activePage="configuracoes" title="Configurações" eyebrow="ADMINISTRAÇÃO" description="Ajuste preferências do programa, perfis de acesso e informações institucionais." items={[["Perfis e permissões", "Equipe, afiliadas e financeiro", "◈"], ["Dados do programa", "Informações institucionais do Pollen Parque", "□"], ["Preferências", "Notificações e visualização", "⚙"]].map(([title, description, icon]) => ({ title, description, icon }))} />;
}
