import Link from "next/link";

const navigation = [
  ["visao-geral", "Visão geral", "◈", "/"],
  ["afiliadas", "Afiliadas", "▱", "/afiliadas"],
  ["documentos", "Documentos", "□", "/documentos"],
  ["financeiro", "Financeiro", "$", "/financeiro"],
  ["comunicacoes", "Comunicações", "↗", "/comunicacoes"],
];

export default function AppShell({ children, activePage = "visao-geral", breadcrumb = "Visão geral" }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Pollen Parque - início"><span className="brand-mark">P</span><span>Pollen <em>Parque</em></span></Link>
        <div className="workspace-label">GESTÃO DO PROGRAMA</div>
        <nav className="main-nav" aria-label="Navegação principal">
          {navigation.map(([key, label, icon, href]) => <Link className={`nav-item ${activePage === key ? "active" : ""}`} href={href} key={key} aria-current={activePage === key ? "page" : undefined} title={label}><span className="nav-icon" aria-hidden="true">{icon}</span>{label}{key === "afiliadas" && <span className="nav-count">30</span>}</Link>)}
        </nav>
        <div className="sidebar-bottom">
          <Link className={`nav-item ${activePage === "configuracoes" ? "active" : ""}`} href="/configuracoes" aria-current={activePage === "configuracoes" ? "page" : undefined} title="Configurações"><span className="nav-icon" aria-hidden="true">⚙</span>Configurações</Link>
          <div className="user-chip"><span className="avatar small">JS</span><span><strong>Joana Silva</strong><small>Equipe do programa</small></span><span className="more">•••</span></div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div className="breadcrumb">Programa <span>/</span> <strong>{breadcrumb}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notificações">♧<i /></button><div className="top-avatar">JS</div></div></header>
        {children}
      </main>
    </div>
  );
}
