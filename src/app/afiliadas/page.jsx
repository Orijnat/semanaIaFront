import AppShell from "../../components/AppShell";
import AffiliatesTable from "../../components/AffiliatesTable";

export default function AfiliadasPage() {
  return <AppShell activePage="afiliadas" breadcrumb="Afiliadas"><div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">BASE DE AFILIADAS</p><h1>Afiliadas</h1><p className="subheading">Acompanhe empresas e responsáveis em cada etapa do processo.</p></div><button className="primary-button">+ <span>Nova afiliada</span></button></section><AffiliatesTable /></div></AppShell>;
}
