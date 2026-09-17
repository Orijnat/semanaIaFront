/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "../services/api";

const navigation = [
  ["visao-geral", "Visão geral", "◈", "/"],
  ["afiliadas", "Afiliadas", "▱", "/afiliadas"],
  ["documentos", "Documentos", "□", "/documentos"],
  ["financeiro", "Financeiro", "$", "/financeiro"],
  ["espacos", "Espaços físicos", "□", "/espacos"],
  ["comunicacoes", "Comunicações", "↗", "/comunicacoes"],
];

export default function AppShell({ children, activePage = "visao-geral", breadcrumb = "Visão geral" }) {
  const [documentsOpen, setDocumentsOpen] = useState(activePage === "documentos");
  const [user] = useState(() => api.auth.getCurrentUser());
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!api.auth.isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  function handleLogout() {
    api.auth.logout();
    router.replace("/login");
  }

  const userAvatar = user?.avatar || "JS";
  const userName = user?.name || "Joana Silva";
  const userRole = user?.role || "Equipe do programa";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Pollen Parque - início">
          <img
            src="/logo-black.svg"
            alt="Pollen Parque Científico Tecnológico"
            width={176}
            height={39}
            className="img-fluid brand-logo"
            loading="lazy"
          />
        </Link>
        <div className="workspace-label">GESTÃO DO PROGRAMA</div>
        <nav className="main-nav" aria-label="Navegação principal">
          {navigation.map(([key, label, icon, href]) => key === "documentos" ? (
            <div className="nav-group" key={key}>
              <button
                className={`nav-item nav-dropdown-trigger ${activePage === key ? "active" : ""}`}
                type="button"
                onClick={() => setDocumentsOpen((current) => !current)}
                aria-expanded={documentsOpen}
                title={label}
              >
                <span className="nav-icon" aria-hidden="true">{icon}</span>
                {label}
                <span className={`nav-chevron ${documentsOpen ? "open" : ""}`} aria-hidden="true">⌄</span>
              </button>
              {documentsOpen && (
                <div className="nav-submenu">
                  <Link href="/pendencias/documentos">Pendentes</Link>
                  <Link href="/documentos/validade">Validades próximas</Link>
                  <Link href="/documentos/historico">Histórico de envios</Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              className={`nav-item ${activePage === key ? "active" : ""}`}
              href={href}
              key={key}
              aria-current={activePage === key ? "page" : undefined}
              title={label}
            >
              <span className="nav-icon" aria-hidden="true">{icon}</span>
              {label}
              {key === "afiliadas" && <span className="nav-count">30</span>}
            </Link>
          ))}
          <Link
            className="nav-item portal-shortcut-link"
            href="/portal-empresa"
            title="Acessar Visão da Empresa Afiliada"
          >
            <span className="nav-icon" aria-hidden="true">🏢</span>
            Portal da Afiliada
            <span className="nav-badge-pill">Afiliada</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <Link
            className={`nav-item ${activePage === "configuracoes" ? "active" : ""}`}
            href="/configuracoes"
            aria-current={activePage === "configuracoes" ? "page" : undefined}
            title="Configurações"
          >
            <span className="nav-icon" aria-hidden="true">⚙</span>
            Configurações
          </Link>
          <button className="user-chip" type="button" onClick={handleLogout} title="Sair">
            <span className="avatar small">{userAvatar}</span>
            <span>
              <strong>{userName}</strong>
              <small>{userRole}</small>
            </span>
            <span className="more">Sair</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Programa <span>/</span> <strong>{breadcrumb}</strong>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notificações">
              ♧<i />
            </button>
            <div className="top-avatar">{userAvatar}</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
