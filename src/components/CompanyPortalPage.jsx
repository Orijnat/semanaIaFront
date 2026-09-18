/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../services/api";
import ContractModal from "./ContractModal";

export default function CompanyPortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user] = useState(() => api.auth.getCurrentUser());

  // Estados dos Modais
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocForUpload, setSelectedDocForUpload] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [renewalModalOpen, setRenewalModalOpen] = useState(false);
  const [renewalSuccess, setRenewalSuccess] = useState(false);
  const [renewalLoading, setRenewalLoading] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (!api.auth.isAuthenticated()) {
      router.replace("/login?next=/portal-empresa");
      return;
    }

    const companyId = user?.companyId?.startsWith('affiliate-') ? '11111111-1111-1111-1111-111111111101' : (user?.companyId || "11111111-1111-1111-1111-111111111101");
    api.portal.getCompanyData(companyId)
      .then((data) => {
        setPortalData(data);
      })
      .catch(() => {
        setFeedbackMessage({ text: "Não foi possível carregar os dados completos.", type: "error" });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router, user]);

  function handleLogout() {
    api.auth.logout();
    router.replace("/login");
  }

  function handleOpenUpload(doc = null) {
    setSelectedDocForUpload(doc);
    setUploadFile(null);
    setUploadModalOpen(true);
  }

  function handleOpenPayment(payment) {
    setSelectedPayment(payment);
    setCopiedCode(false);
    setPaymentModalOpen(true);
  }

  function handleCopyBarcode(code) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  }

  async function handleUploadSubmit(event) {
    event.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    try {
      // Simula envio e atualiza estado local
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedDocs = portalData.pendingDocuments.map((doc) => {
        if (selectedDocForUpload && doc.id === selectedDocForUpload.id) {
          return {
            ...doc,
            situacao: "Em análise pela equipe",
            statusClass: "analysis",
            instrucao: `Enviado arquivo "${uploadFile.name}". Em conferência.`
          };
        }
        return doc;
      });

      setPortalData((prev) => ({ ...prev, pendingDocuments: updatedDocs }));
      setUploadModalOpen(false);
      setFeedbackMessage({ text: "Documento enviado com sucesso! A equipe do Pollen fará a conferência.", type: "success" });
      setTimeout(() => setFeedbackMessage({ text: "", type: "" }), 5000);
    } catch {
      setFeedbackMessage({ text: "Erro ao enviar arquivo.", type: "error" });
    } finally {
      setUploading(false);
    }
  }

  async function handleRenewalSubmit(event) {
    event.preventDefault();
    setRenewalLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setRenewalSuccess(true);
      setFeedbackMessage({
        text: "Solicitação de renovação registrada! O gestor de parcerias entrará em contato em breve.",
        type: "success"
      });
      setTimeout(() => {
        setRenewalModalOpen(false);
        setRenewalSuccess(false);
        setTimeout(() => setFeedbackMessage({ text: "", type: "" }), 5000);
      }, 1500);
    } finally {
      setRenewalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="company-portal-loading">
        <div className="portal-loading-spinner" />
        <p>Carregando Portal da Afiliada...</p>
      </div>
    );
  }

  const company = portalData?.company || {};
  const contract = portalData?.contract || {};
  const benefits = portalData?.benefits || [];
  const pendingDocuments = portalData?.pendingDocuments || [];
  const payments = portalData?.payments || [];

  const urgentDocsCount = pendingDocuments.filter((d) => d.situacao.toLowerCase().includes("pendente")).length;
  const pendingPayments = payments.filter((p) => p.status.toLowerCase().includes("aguardando"));
  const pendingPaymentsTotal = pendingPayments.reduce((acc, curr) => acc + curr.valor, 0);

  return (
    <div className="app-shell company-portal-layout">
      {/* Sidebar do Portal da Empresa */}
      <aside className="sidebar company-sidebar">
        <Link className="brand" href="/portal-empresa" aria-label="Pollen Parque - Início">
          <img
            src="/logo-black.svg"
            alt="Pollen Parque Científico Tecnológico"
            width={176}
            height={39}
            className="img-fluid brand-logo"
            loading="lazy"
          />
        </Link>
        <div className="workspace-label">PORTAL DA AFILIADA</div>

        <nav className="main-nav" aria-label="Navegação da empresa">
          <button
            type="button"
            className={`nav-item ${activeTab === "visao-geral" ? "active" : ""}`}
            onClick={() => setActiveTab("visao-geral")}
          >
            <span className="nav-icon" aria-hidden="true">◈</span>
            Visão Geral
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "beneficios" ? "active" : ""}`}
            onClick={() => setActiveTab("beneficios")}
          >
            <span className="nav-icon" aria-hidden="true">★</span>
            Benefícios Ativos
            <span className="nav-count">{benefits.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "documentos" ? "active" : ""}`}
            onClick={() => setActiveTab("documentos")}
          >
            <span className="nav-icon" aria-hidden="true">□</span>
            Documentos
            {urgentDocsCount > 0 && <span className="nav-count warning">{urgentDocsCount}</span>}
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "financeiro" ? "active" : ""}`}
            onClick={() => setActiveTab("financeiro")}
          >
            <span className="nav-icon" aria-hidden="true">$</span>
            Financeiro & Anuidade
            {pendingPayments.length > 0 && <span className="nav-count">{pendingPayments.length}</span>}
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === "espacos" ? "active" : ""}`}
            onClick={() => setActiveTab("espacos")}
          >
            <span className="nav-icon" aria-hidden="true">▱</span>
            Espaços & Reservas
          </button>
        </nav>

        <div className="sidebar-bottom">
          {user?.role === "Equipe do programa" && (
            <Link className="nav-item" href="/" title="Voltar ao Painel Geral da Equipe">
              <span className="nav-icon" aria-hidden="true">↩</span>
              Painel da Equipe
            </Link>
          )}
          <button className="user-chip" type="button" onClick={handleLogout} title="Sair do portal">
            <span className="avatar small">{user?.avatar || "AF"}</span>
            <span>
              <strong>{user?.name || company.representanteNome}</strong>
              <small>{company.nomeFantasia || "Empresa Afiliada"}</small>
            </span>
            <span className="more">Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal do Portal */}
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Portal da Afiliada <span>/</span> <strong>{company.nomeFantasia}</strong>
          </div>
          <div className="top-actions">
            <span className="company-header-badge">
              <span className="status-dot green" /> Afiliada Ativa
            </span>
            <div className="top-avatar">{user?.avatar || "AF"}</div>
          </div>
        </header>

        <div className="content-wrap company-portal-wrap">
          {/* Mensagens de Feedback */}
          {feedbackMessage.text && (
            <div className={`portal-alert-banner ${feedbackMessage.type}`}>
              {feedbackMessage.text}
            </div>
          )}

          {/* Banner de Boas-Vindas da Empresa */}
          <section className="welcome-row company-profile-header">
            <div>
              <p className="eyebrow">PROGRAMA DE PARCERIAS POLLEN PARQUE</p>
              <h1>{company.nomeFantasia}</h1>
              <p className="subheading">
                {company.razaoSocial} • CNPJ: {company.cnpj} • Sala: {company.endereco.split("-").pop() || "Sede Pollen"}
              </p>
            </div>
            <div className="company-header-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setRenewalModalOpen(true)}
              >
                ↻ Solicitar Renovação
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() => handleOpenUpload(null)}
              >
                + <span>Enviar Documento</span>
              </button>
            </div>
          </section>

          {/* 4 Cards de Destaque / KPIs da Empresa */}
          <section className="metrics-grid company-metrics" aria-label="Resumo da empresa">
            {/* 1. Vigência e Próxima Anuidade */}
            <article className="metric-card accent">
              <div className="metric-label">
                <span>Vigência da Anuidade</span>
                <b>↻ {contract.status}</b>
              </div>
              <strong>{contract.diasRestantes} dias</strong>
              <small>
                Término: {contract.dataTermino} • Próx. Renovação: <strong>{contract.proximaRenovacao}</strong>
              </small>
            </article>

            {/* 2. Pagamentos Pendentes */}
            <article className="metric-card">
              <div className="metric-label">
                <span>Pagamentos em Aberto</span>
                <b className={pendingPayments.length > 0 ? "warning-text" : ""}>$</b>
              </div>
              <strong className={pendingPayments.length > 0 ? "warning-text" : ""}>
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(pendingPaymentsTotal)}
              </strong>
              <small>
                {pendingPayments.length > 0
                  ? `${pendingPayments.length} cobrança(s) aguardando pagamento`
                  : "Todos os pagamentos em dia"}
              </small>
            </article>

            {/* 3. Documentos Pendentes */}
            <article className="metric-card">
              <div className="metric-label">
                <span>Pendências de Documentos</span>
                <b className={urgentDocsCount > 0 ? "warning-text" : ""}>!</b>
              </div>
              <strong className={urgentDocsCount > 0 ? "warning-text" : ""}>
                {urgentDocsCount === 0 ? "Em dia" : `${urgentDocsCount} pendente(s)`}
              </strong>
              <small>
                {urgentDocsCount > 0 ? "Ação requerida pela sua empresa" : "Documentação 100% conferida"}
              </small>
            </article>

            {/* 4. Franquia de Benefícios */}
            <article className="metric-card">
              <div className="metric-label">
                <span>Franquia Mensal de Uso</span>
                <b>★</b>
              </div>
              <strong>40h / mês</strong>
              <small>Laboratórios, coworking e 10h em salas de reunião</small>
            </article>
          </section>

          {/* Renderização Condicional das Abas */}

          {/* ABA 1: VISÃO GERAL */}
          {activeTab === "visao-geral" && (
            <div className="company-portal-grid">
              {/* Coluna Esquerda: Pendências Urgentes e Próximos Pagamentos */}
              <div className="portal-left-col">
                {/* Painel: Documentos Pendentes */}
                <section className="panel company-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">DOCUMENTAÇÃO</p>
                      <h2>Documentos & Regularidade</h2>
                    </div>
                    <button className="text-button" type="button" onClick={() => setActiveTab("documentos")}>
                      Ver todos <span>→</span>
                    </button>
                  </div>

                  <div className="company-doc-list">
                    {pendingDocuments.map((doc) => (
                      <div key={doc.id} className="company-doc-item">
                        <div className="doc-item-icon">📄</div>
                        <div className="doc-item-info">
                          <strong>{doc.tipo}</strong>
                          <p>{doc.instrucao}</p>
                          <small>Exigência: {doc.dataExigencia} • Validade: {doc.validade}</small>
                        </div>
                        <div className="doc-item-action">
                          <span className={`status ${doc.statusClass}`}>{doc.situacao}</span>
                          {doc.situacao.toLowerCase().includes("pendente") && (
                            <button
                              className="secondary-button small"
                              type="button"
                              onClick={() => handleOpenUpload(doc)}
                            >
                              Enviar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Painel: Pagamentos e Anuidade */}
                <section className="panel company-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">CONTROLE FINANCEIRO</p>
                      <h2>Anuidade & Faturas</h2>
                    </div>
                    <button className="text-button" type="button" onClick={() => setActiveTab("financeiro")}>
                      Histórico financeiro <span>→</span>
                    </button>
                  </div>

                  <div className="company-payment-list">
                    {payments.map((p) => (
                      <div key={p.id} className="company-payment-item">
                        <div className="payment-icon">$</div>
                        <div className="payment-details">
                          <strong>{p.tipo} • Comp. {p.competencia}</strong>
                          <p>
                            Vencimento: <b>{p.vencimento}</b> {p.nfNumero && `• ${p.nfNumero}`}
                          </p>
                        </div>
                        <div className="payment-value-box">
                          <span className="payment-amount">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.valor)}
                          </span>
                          <span className={`status ${p.statusClass}`}>{p.status}</span>
                        </div>
                        {p.status.toLowerCase().includes("aguardando") && (
                          <button
                            className="primary-button small"
                            type="button"
                            onClick={() => handleOpenPayment(p)}
                          >
                            Pagar
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Coluna Direita: Benefícios em Destaque e Vigência */}
              <div className="portal-right-col">
                {/* Card de Vigência e Renovação */}
                <section className="panel company-renewal-panel">
                  <div className="renewal-badge">Vigência Contratual</div>
                  <h3>Plano {company.categoria}</h3>
                  <p className="renewal-desc">
                    Sua anuidade garante acesso irrestrito às facilidades e apoio ao desenvolvimento do Pollen Parque.
                  </p>

                  <div className="renewal-details-box">
                    <div className="renewal-detail-row">
                      <span>Termo de Parceria:</span>
                      <strong>{contract.numeroTermo}</strong>
                    </div>
                    <div className="renewal-detail-row">
                      <span>Início da Vigência:</span>
                      <strong>{contract.dataInicio}</strong>
                    </div>
                    <div className="renewal-detail-row">
                      <span>Término / Renovação:</span>
                      <strong>{contract.dataTermino}</strong>
                    </div>
                    <div className="renewal-detail-row">
                      <span>Forma da Anuidade:</span>
                      <strong>{contract.formaPagamento}</strong>
                    </div>
                    <div className="renewal-detail-row">
                      <span>Status Procuradoria:</span>
                      <strong className="active-tag">✓ {contract.procuradoriaStatus}</strong>
                    </div>
                  </div>

                  <button
                    className="primary-button full-width"
                    type="button"
                    onClick={() => setRenewalModalOpen(true)}
                  >
                    Solicitar Renovação da Anuidade
                  </button>
                  <button
                    className="secondary-button full-width"
                    type="button"
                    style={{ marginTop: "8px" }}
                    onClick={() => setContractModalOpen(true)}
                  >
                    📄 Visualizar / Baixar Minuta Contratual
                  </button>
                </section>

                {/* Card de Acesso aos Benefícios */}
                <section className="panel company-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">SEUS BENEFÍCIOS</p>
                      <h2>Vantagens da Afiliada</h2>
                    </div>
                    <button className="text-button" type="button" onClick={() => setActiveTab("beneficios")}>
                      Explorar <span>→</span>
                    </button>
                  </div>

                  <div className="quick-benefits-list">
                    {benefits.slice(0, 4).map((b) => (
                      <div key={b.id} className="quick-benefit-item">
                        <span className="benefit-emoji">{b.icon}</span>
                        <div>
                          <strong>{b.title}</strong>
                          <p>{b.description}</p>
                          <span className="benefit-badge">{b.badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* ABA 2: BENEFÍCIOS DETALHADOS */}
          {activeTab === "beneficios" && (
            <section className="panel company-panel full-width">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">PACOTE DE BENEFÍCIOS</p>
                  <h2>Todos os Benefícios da Parceria Pollen Parque</h2>
                  <p className="subheading">
                    Confira as vantagens institucionais, espaciais e tecnológicas incluídas na sua anuidade.
                  </p>
                </div>
              </div>

              <div className="benefits-grid">
                {benefits.map((b) => (
                  <article key={b.id} className="benefit-full-card">
                    <div className="benefit-card-header">
                      <span className="benefit-big-icon">{b.icon}</span>
                      <span className="benefit-category-pill">{b.category}</span>
                    </div>
                    <h3>{b.title}</h3>
                    <p>{b.description}</p>
                    <div className="benefit-card-footer">
                      <span className="benefit-badge highlight">{b.badge}</span>
                      <button
                        className="secondary-button small"
                        type="button"
                        onClick={() => {
                          setFeedbackMessage({
                            text: `Solicitação para utilizar o benefício "${b.title}" registrada com sucesso!`,
                            type: "success"
                          });
                          setTimeout(() => setFeedbackMessage({ text: "", type: "" }), 4000);
                        }}
                      >
                        Utilizar Benefício
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ABA 3: DOCUMENTOS E PENDÊNCIAS */}
          {activeTab === "documentos" && (
            <section className="panel company-panel full-width">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">CENTRAL DE DOCUMENTOS</p>
                  <h2>Documentação da Empresa e Conformidade</h2>
                  <p className="subheading">
                    Mantenha as certidões e termos em dia para assegurar a vigência regular do contrato de afiliação.
                  </p>
                </div>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => handleOpenUpload(null)}
                >
                  + Enviar Novo Documento
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>DOCUMENTO / TIPO</th>
                      <th>EXIGÊNCIA / VALIDADE</th>
                      <th>SITUAÇÃO</th>
                      <th>AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <strong>{doc.tipo}</strong>
                          <small>{doc.instrucao}</small>
                        </td>
                        <td>
                          <span>Exigência: {doc.dataExigencia}</span>
                          <br />
                          <small>Validade: {doc.validade}</small>
                        </td>
                        <td>
                          <span className={`status ${doc.statusClass}`}>{doc.situacao}</span>
                        </td>
                        <td>
                          <button
                            className="primary-button small"
                            type="button"
                            onClick={() => handleOpenUpload(doc)}
                          >
                            Substituir / Enviar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ABA 4: FINANCEIRO & ANUIDADE */}
          {activeTab === "financeiro" && (
            <section className="panel company-panel full-width">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">DADOS FINANCEIROS & ANUIDADE</p>
                  <h2>Gestão de Cobranças e Quitações</h2>
                  <p className="subheading">
                    Consulte as faturas emitidas pela contabilidade do Pollen Parque, notas fiscais e comprovantes.
                  </p>
                </div>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setRenewalModalOpen(true)}
                >
                  ↻ Próxima Renovação ({contract.proximaRenovacao})
                </button>
              </div>

              <div className="financial-summary-banner">
                <div className="summary-item">
                  <span>Próximo Vencimento</span>
                  <strong>{pendingPayments[0]?.vencimento || "Em dia"}</strong>
                </div>
                <div className="summary-item">
                  <span>Valor Pendente</span>
                  <strong className={pendingPaymentsTotal > 0 ? "warning-text" : ""}>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(pendingPaymentsTotal)}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>Plano de Anuidade</span>
                  <strong>{contract.formaPagamento}</strong>
                </div>
                <div className="summary-item">
                  <span>Vigência Atual</span>
                  <strong>{contract.dataInicio} até {contract.dataTermino}</strong>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>COMPETÊNCIA / DESCRIÇÃO</th>
                      <th>VALOR</th>
                      <th>VENCIMENTO</th>
                      <th>SITUAÇÃO</th>
                      <th>AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.tipo}</strong>
                          <br />
                          <small>Competência: {p.competencia} {p.nfNumero && `• ${p.nfNumero}`}</small>
                        </td>
                        <td>
                          <strong>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.valor)}</strong>
                        </td>
                        <td>{p.vencimento}</td>
                        <td>
                          <span className={`status ${p.statusClass}`}>{p.status}</span>
                        </td>
                        <td>
                          {p.status.toLowerCase().includes("aguardando") ? (
                            <button
                              className="primary-button small"
                              type="button"
                              onClick={() => handleOpenPayment(p)}
                            >
                              Ver Boleto / Código
                            </button>
                          ) : (
                            <span className="payment-receipt-tag">✓ Quitado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ABA 5: ESPAÇOS E AGENDAMENTOS */}
          {activeTab === "espacos" && (
            <section className="panel company-panel full-width">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">INFRAESTRUTURA FÍSICA</p>
                  <h2>Espaços Disponíveis para a sua Empresa</h2>
                  <p className="subheading">
                    Agende reuniões, utilize laboratórios e reserve salas inclusas na sua parceria.
                  </p>
                </div>
              </div>

              <div className="spaces-grid">
                <div className="space-card">
                  <div className="space-card-top">
                    <span className="space-icon">🏢</span>
                    <span className="space-status disponivel">Incluso na Franquia</span>
                  </div>
                  <h3>Sala de Reunião Araucária</h3>
                  <p>Capacidade: 10 pessoas • Display 4K • Climatizada</p>
                  <div className="space-meta">
                    <span>Franquia disponível: <strong>10h / mês</strong></span>
                  </div>
                  <button
                    className="primary-button small"
                    type="button"
                    style={{ marginTop: "15px", width: "100%" }}
                    onClick={() => {
                      setFeedbackMessage({ text: "Agendamento da Sala Araucária solicitado para a equipe!", type: "success" });
                      setTimeout(() => setFeedbackMessage({ text: "", type: "" }), 4000);
                    }}
                  >
                    Agendar Horário
                  </button>
                </div>

                <div className="space-card">
                  <div className="space-card-top">
                    <span className="space-icon">🔬</span>
                    <span className="space-status disponivel">Acesso 24/7</span>
                  </div>
                  <h3>Laboratório de Biotecnologia & Prototipagem</h3>
                  <p>Bancadas técnicas e equipamentos de precisão</p>
                  <div className="space-meta">
                    <span>Franquia mensal: <strong>40h de uso</strong></span>
                  </div>
                  <button
                    className="primary-button small"
                    type="button"
                    style={{ marginTop: "15px", width: "100%" }}
                    onClick={() => {
                      setFeedbackMessage({ text: "Acesso ao Laboratório liberado na recepção do parque!", type: "success" });
                      setTimeout(() => setFeedbackMessage({ text: "", type: "" }), 4000);
                    }}
                  >
                    Reservar Bancada
                  </button>
                </div>

                <div className="space-card">
                  <div className="space-card-top">
                    <span className="space-icon">🎤</span>
                    <span className="space-status disponivel">Desconto Especial</span>
                  </div>
                  <h3>Auditório Principal Pollen</h3>
                  <p>Capacidade: 120 pessoas • Sistema de Som e Transmissão</p>
                  <div className="space-meta">
                    <span>Vantagem afiliada: <strong>50% de desconto</strong></span>
                  </div>
                  <button
                    className="secondary-button small"
                    type="button"
                    style={{ marginTop: "15px", width: "100%" }}
                    onClick={() => {
                      setFeedbackMessage({ text: "Solicitação de reserva do auditório enviada para cotação!", type: "success" });
                      setTimeout(() => setFeedbackMessage({ text: "", type: "" }), 4000);
                    }}
                  >
                    Solicitar Orçamento
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* MODAL: UPLOAD DE DOCUMENTO PENDENTE */}
      {uploadModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setUploadModalOpen(false)}>
          <section className="crud-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <p className="eyebrow">PORTAL DA AFILIADA</p>
                <h2>Enviar Documento</h2>
              </div>
              <button className="modal-close" type="button" onClick={() => setUploadModalOpen(false)} aria-label="Fechar">
                ×
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="modal-fields">
                <label className="modal-field">
                  Tipo de Documento *
                  <input
                    type="text"
                    defaultValue={selectedDocForUpload ? selectedDocForUpload.tipo : "Certidão Negativa de Débitos (CND)"}
                    required
                  />
                </label>

                <label className="modal-field">
                  Selecionar Arquivo (PDF, PNG ou JPG) *
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    required
                    onChange={(e) => setUploadFile(e.target.files[0])}
                  />
                </label>

                <label className="modal-field">
                  Observações / Informações Adicionais
                  <textarea
                    rows="2"
                    placeholder="Ex: Certidão atualizada com validade até 2027..."
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button className="secondary-button" type="button" onClick={() => setUploadModalOpen(false)}>
                  Cancelar
                </button>
                <button className="primary-button" type="submit" disabled={uploading || !uploadFile}>
                  {uploading ? "Enviando arquivo..." : "Confirmar Envio"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL: PAGAMENTO / BOLETO / CÓDIGO DE BARRAS */}
      {paymentModalOpen && selectedPayment && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setPaymentModalOpen(false)}>
          <section className="crud-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <p className="eyebrow">COBRANÇA DA AFILIADA</p>
                <h2>{selectedPayment.tipo}</h2>
              </div>
              <button className="modal-close" type="button" onClick={() => setPaymentModalOpen(false)} aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="modal-fields">
              <div className="payment-modal-card">
                <div className="payment-modal-header">
                  <span>Valor a pagar:</span>
                  <strong>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedPayment.valor)}
                  </strong>
                </div>
                <p>Vencimento: <strong>{selectedPayment.vencimento}</strong> • {selectedPayment.nfNumero}</p>
              </div>

              <label className="modal-field">
                Linha Digitável do Boleto:
                <div className="barcode-copy-row">
                  <input
                    type="text"
                    readOnly
                    value={selectedPayment.linhaDigitavel}
                    className="barcode-input"
                  />
                  <button
                    className="primary-button small"
                    type="button"
                    onClick={() => handleCopyBarcode(selectedPayment.linhaDigitavel)}
                  >
                    {copiedCode ? "Copiado! ✓" : "Copiar"}
                  </button>
                </div>
              </label>

              <div className="payment-instructions-box">
                <p>💡 Você também pode efetuar o pagamento via Internet Banking do seu banco com o código copiado.</p>
                <small>Após o pagamento, a compensação bancária é reconhecida automaticamente em até 2 dias úteis.</small>
              </div>
            </div>

            <div className="modal-footer">
              <button className="secondary-button" type="button" onClick={() => setPaymentModalOpen(false)}>
                Fechar
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  setPaymentModalOpen(false);
                  setFeedbackMessage({ text: "Comprovante informado. O financeiro dará baixa assim que compensado.", type: "success" });
                  setTimeout(() => setFeedbackMessage({ text: "", type: "" }), 4000);
                }}
              >
                Informar Pagamento Realizado
              </button>
            </div>
          </section>
        </div>
      )}

      {/* MODAL: SOLICITAÇÃO DE RENOVAÇÃO DE ANUIDADE */}
      {renewalModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setRenewalModalOpen(false)}>
          <section className="crud-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <p className="eyebrow">PROGRAMA DE AFILIADAS</p>
                <h2>Renovação de Anuidade 2027</h2>
              </div>
              <button className="modal-close" type="button" onClick={() => setRenewalModalOpen(false)} aria-label="Fechar">
                ×
              </button>
            </div>

            {renewalSuccess ? (
              <div className="modal-fields" style={{ textAlign: "center", padding: "30px 20px" }}>
                <span style={{ fontSize: "36px" }}>🎉</span>
                <h3 style={{ margin: "10px 0 5px", color: "#244735" }}>Solicitação Recebida!</h3>
                <p style={{ color: "#65766c", fontSize: "13px" }}>
                  A coordenação do Pollen Parque iniciará o processo de confecção do aditivo e entrará em contato.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRenewalSubmit}>
                <div className="modal-fields">
                  <p style={{ fontSize: "12px", color: "#52645a", lineHeight: "1.6" }}>
                    Sua vigência atual encerra em <strong>{contract.dataTermino}</strong>. Ao solicitar a renovação, a equipe do Pollen preparará a minuta de renovação e manterá todos os seus benefícios e reservas ativas sem interrupção.
                  </p>

                  <label className="modal-field">
                    Plano Desejado para 2027:
                    <select defaultValue="residente">
                      <option value="residente">Afiliada Residente & Tecnológica (Manter atual)</option>
                      <option value="conectar">Afiliada Conectada / Remota</option>
                      <option value="laboratorio">Afiliada com Franquia Estendida de Laboratórios</option>
                    </select>
                  </label>

                  <label className="modal-field">
                    Contato do Responsável pela Renovação:
                    <input type="text" defaultValue={`${company.representanteNome} (${company.emailContato})`} required />
                  </label>

                  <label className="modal-field">
                    Observações ou Novas Demandas da Empresa:
                    <textarea rows="2" placeholder="Ex: Gostaríamos de aumentar a franquia de coworking para 2027..." />
                  </label>
                </div>

                <div className="modal-footer">
                  <button className="secondary-button" type="button" onClick={() => setRenewalModalOpen(false)}>
                    Cancelar
                  </button>
                  <button className="primary-button" type="submit" disabled={renewalLoading}>
                    {renewalLoading ? "Enviando solicitação..." : "Confirmar Solicitação"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      {contractModalOpen && (
        <ContractModal
          company={{
            id: company.id || user?.companyId,
            razaoSocial: company.razaoSocial || company.nomeFantasia,
            name: company.razaoSocial || company.nomeFantasia,
            cnpj: company.cnpj,
            residente: company.residente
          }}
          initialContract={
            contract.id || contract.conteudoGerado
              ? {
                  id: contract.id,
                  numeroTermo: contract.numeroTermo,
                  conteudoGerado: contract.conteudoGerado || (company.residente === false ? `[PDF GERADO] /uploads/contratos/contrato_${company.id || user?.companyId}.pdf` : null),
                  valorAnuidade: contract.valorAnuidadeAnual
                }
              : null
          }
          onClose={() => setContractModalOpen(false)}
        />
      )}
    </div>
  );
}
