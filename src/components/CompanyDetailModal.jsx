"use client";

import { useEffect, useState } from "react";
import { api, getStaticUrl } from "../services/api";
import ContractModal from "./ContractModal";

const PIPELINE_STATUSES = [
  { key: "EM_ANALISE", label: "Em análise", class: "analysis" },
  { key: "DOCUMENTACAO_PENDENTE", label: "Documentação pendente", class: "pending" },
  { key: "MINUTA_GERADA", label: "Contrato em preparação", class: "contract" },
  { key: "ENVIADO_PROCURADORIA", label: "Enviado à Procuradoria", class: "contract" },
  { key: "EM_ASSINATURA", label: "Assinatura pendente", class: "contract" },
  { key: "AGUARDANDO_PAGAMENTO", label: "Aguardando pagamento", class: "payment" },
  { key: "ATIVO", label: "Ativo", class: "active" },
  { key: "VENCIDO", label: "Vencido", class: "pending" },
  { key: "DESLIGADO", label: "Encerrado", class: "analysis" }
];

export default function CompanyDetailModal({ companyId, initialCompany, onClose, onCompanyUpdated }) {
  const [activeTab, setActiveTab] = useState("geral");
  const [companyData, setCompanyData] = useState(initialCompany || null);
  const [loading, setLoading] = useState(() => Boolean(companyId && !String(companyId).startsWith("affiliate-")));
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ text: "", type: "" });

  // Estado para modal de contrato
  const [contractModalOpen, setContractModalOpen] = useState(false);

  // Estados de ações
  const [newStatus, setNewStatus] = useState("");
  const [statusJustificativa, setStatusJustificativa] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Estados de upload de documento
  const [uploadTipo, setUploadTipo] = useState("CONTRATO_SOCIAL");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!companyId || String(companyId).startsWith("affiliate-")) {
      return;
    }

    let mounted = true;
    api.companies.getById(companyId)
      .then((data) => {
        if (mounted && data) {
          setCompanyData(data);
          setNewStatus(data.status || "EM_ANALISE");
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar detalhes da empresa:", err);
        if (mounted) setError("Não foi possível carregar os dados completos da API.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [companyId]);

  const company = companyData || initialCompany || {};
  const contratos = company.contratos || [];
  const activeContrato = contratos[0] || null;
  const assinaturas = company.assinaturas || [];
  const documentos = company.documentos || [];
  const faturas = company.faturas || [];

  async function handleStatusChange(event) {
    event.preventDefault();
    if (!newStatus || newStatus === company.status) return;

    setStatusUpdating(true);
    setFeedback({ text: "", type: "" });
    try {
      if (company.id && !String(company.id).startsWith("affiliate-")) {
        await api.companies.updateStatus(company.id, newStatus, statusJustificativa);
      }
      setCompanyData((prev) => ({ ...prev, status: newStatus }));
      setFeedback({ text: `Etapa atualizada para "${newStatus}" com sucesso!`, type: "success" });
      setStatusJustificativa("");
      if (onCompanyUpdated) onCompanyUpdated({ ...company, status: newStatus });
    } catch (err) {
      setFeedback({ text: err.response?.data?.message || "Erro ao atualizar etapa.", type: "error" });
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleToggleSignature(ass) {
    try {
      const novoStatus = !ass.assinado;
      await api.signatures.update(company.id, ass.signatarioTipo, {
        assinado: novoStatus,
        dataAssinatura: novoStatus ? new Date().toISOString() : null
      });

      setCompanyData((prev) => ({
        ...prev,
        assinaturas: prev.assinaturas.map((a) =>
          a.id === ass.id ? { ...a, assinado: novoStatus, dataAssinatura: novoStatus ? new Date().toISOString() : null } : a
        )
      }));
      setFeedback({ text: `Assinatura de ${ass.nome || ass.signatarioTipo} atualizada!`, type: "success" });
    } catch (err) {
      setFeedback({ text: err.response?.data?.message || "Erro ao alternar assinatura.", type: "error" });
    }
  }

  async function handleDocumentUpload(event) {
    event.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setFeedback({ text: "", type: "" });
    try {
      const novoDoc = await api.documents.upload(company.id, uploadFile, uploadTipo);
      setCompanyData((prev) => ({
        ...prev,
        documentos: [novoDoc, ...(prev.documentos || [])]
      }));
      setUploadFile(null);
      setFeedback({ text: "Documento anexado com sucesso!", type: "success" });
    } catch (err) {
      setFeedback({ text: err.response?.data?.message || "Erro ao fazer upload do documento.", type: "error" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDocumentStatus(docId, novoStatus) {
    try {
      await api.documents.updateStatus(docId, novoStatus);
      setCompanyData((prev) => ({
        ...prev,
        documentos: prev.documentos.map((d) => (d.id === docId ? { ...d, statusConferencia: novoStatus } : d))
      }));
      setFeedback({ text: `Documento marcado como ${novoStatus}!`, type: "success" });
    } catch (err) {
      setFeedback({ text: err.response?.data?.message || "Erro ao atualizar conferência.", type: "error" });
    }
  }

  async function handleConfirmInvoicePayment(invoiceId) {
    try {
      await api.finance.confirmPayment(invoiceId, {
        dataPagamento: new Date().toISOString().split("T")[0]
      });
      setCompanyData((prev) => ({
        ...prev,
        faturas: prev.faturas.map((f) => (f.id === invoiceId ? { ...f, status: "PAGO", dataPagamento: new Date().toISOString() } : f))
      }));
      setFeedback({ text: "Pagamento confirmado com sucesso!", type: "success" });
    } catch (err) {
      setFeedback({ text: err.response?.data?.message || "Erro ao confirmar pagamento.", type: "error" });
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="crud-modal company-detail-modal" role="dialog" aria-modal="true" aria-labelledby="company-detail-title">
        {/* Header com Dados Primários */}
        <div className="modal-header">
          <div>
            <div className="flex items-center gap-2">
              <span className={`badge-tag ${company.residente === false ? "externa" : "residente"}`}>
                {company.residente === false ? "Não Residente (Externa)" : "Residente"}
              </span>
              <span className="status contract">{company.status || "EM_ANALISE"}</span>
            </div>
            <h2 id="company-detail-title" style={{ marginTop: "6px" }}>
              {company.razaoSocial || company.name || "Afiliada"}
            </h2>
            {company.nomeFantasia && <small style={{ color: "#7e8b86" }}>Nome Fantasia: {company.nomeFantasia}</small>}
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar modal">×</button>
        </div>

        {/* Abas de Navegação */}
        <div className="detail-tabs-nav">
          <button type="button" className={`detail-tab-btn ${activeTab === "geral" ? "active" : ""}`} onClick={() => setActiveTab("geral")}>
            Visão 360°
          </button>
          <button type="button" className={`detail-tab-btn ${activeTab === "pipeline" ? "active" : ""}`} onClick={() => setActiveTab("pipeline")}>
            Etapa do Processo
          </button>
          <button type="button" className={`detail-tab-btn ${activeTab === "minuta" ? "active" : ""}`} onClick={() => setActiveTab("minuta")}>
            Minuta Contratual
          </button>
          <button type="button" className={`detail-tab-btn ${activeTab === "assinaturas" ? "active" : ""}`} onClick={() => setActiveTab("assinaturas")}>
            Signatários ({assinaturas.filter((a) => a.assinado).length}/{assinaturas.length || 5})
          </button>
          <button type="button" className={`detail-tab-btn ${activeTab === "documentos" ? "active" : ""}`} onClick={() => setActiveTab("documentos")}>
            Documentos ({documentos.length})
          </button>
          <button type="button" className={`detail-tab-btn ${activeTab === "financeiro" ? "active" : ""}`} onClick={() => setActiveTab("financeiro")}>
            Financeiro ({faturas.length})
          </button>
        </div>

        {feedback.text && (
          <div className={`form-feedback ${feedback.type}`} style={{ padding: "10px 24px", margin: "0" }}>
            {feedback.type === "success" ? "✓" : "⚠️"} {feedback.text}
          </div>
        )}

        <div className="company-detail-content">
          {loading ? (
            <div className="empty-state">Carregando dados completos da empresa...</div>
          ) : (
            <>
              {/* ABA 1: DADOS CADASTRAIS 360° */}
              {activeTab === "geral" && (
                <div className="detail-tab-pane">
                  <div className="detail-section-card">
                    <h3>Dados da Organização</h3>
                    <div className="detail-grid">
                      <div>
                        <span>Razão Social:</span>
                        <strong>{company.razaoSocial || company.name || "—"}</strong>
                      </div>
                      <div>
                        <span>Nome Fantasia:</span>
                        <strong>{company.nomeFantasia || "—"}</strong>
                      </div>
                      <div>
                        <span>CNPJ:</span>
                        <strong>{company.cnpj || "—"}</strong>
                      </div>
                      <div>
                        <span>Tipo / Modalidade:</span>
                        <strong>{company.tipo || (company.residente === false ? "EXTERNA" : "STARTUP")}</strong>
                      </div>
                      <div>
                        <span>Ano de Fundação:</span>
                        <strong>{company.anoFundacao || "—"}</strong>
                      </div>
                      <div>
                        <span>Área / Segmento:</span>
                        <strong>{company.areaAtuacao || "—"}</strong>
                      </div>
                      <div>
                        <span>E-mail Corporativo:</span>
                        <strong>{company.emailContato || "—"}</strong>
                      </div>
                      <div>
                        <span>E-mail para Cobrança / NF:</span>
                        <strong>{company.emailCobranca || "—"}</strong>
                      </div>
                      <div>
                        <span>Telefone / WhatsApp:</span>
                        <strong>{company.telefone || "—"}</strong>
                      </div>
                      <div>
                        <span>Site / Mídias:</span>
                        <strong>
                          {company.site ? (
                            <a href={company.site.startsWith("http") ? company.site : `https://${company.site}`} target="_blank" rel="noreferrer" style={{ color: "#3f7158", textDecoration: "underline" }}>
                              {company.site}
                            </a>
                          ) : "—"}
                        </strong>
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <span>Endereço Completo:</span>
                        <strong>
                          {company.enderecoCompleto || "—"}
                          {company.cidade ? ` — ${company.cidade}/${company.estado || "SC"}` : ""}
                          {company.cep ? ` — CEP: ${company.cep}` : ""}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section-card" style={{ marginTop: "16px" }}>
                    <h3>Dados do Representante Legal</h3>
                    <div className="detail-grid">
                      <div>
                        <span>Nome Completo:</span>
                        <strong>{company.representanteNome || "—"}</strong>
                      </div>
                      <div>
                        <span>CPF:</span>
                        <strong>{company.representanteCpf || "—"}</strong>
                      </div>
                      <div>
                        <span>Cargo / Função:</span>
                        <strong>{company.representanteCargo || "—"}</strong>
                      </div>
                      <div>
                        <span>E-mail do Representante:</span>
                        <strong>{company.representanteEmail || "—"}</strong>
                      </div>
                      <div>
                        <span>Telefone / Celular:</span>
                        <strong>{company.representanteTelefone || "—"}</strong>
                      </div>
                      <div>
                        <span>Endereço Residencial:</span>
                        <strong>{company.representanteEndereco || "—"}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: PIPELINE DO PROCESSO */}
              {activeTab === "pipeline" && (
                <div className="detail-tab-pane">
                  <div className="detail-section-card">
                    <h3>Ciclo de Vida da Afiliação</h3>
                    <p className="subheading" style={{ marginBottom: "18px" }}>
                      Etapa atual: <strong>{company.status || "EM_ANALISE"}</strong>
                    </p>

                    <div className="pipeline-stepper">
                      {PIPELINE_STATUSES.map((item, index) => {
                        const isCurrent = company.status === item.key;
                        return (
                          <div key={item.key} className={`stepper-step ${isCurrent ? "current" : ""}`}>
                            <span className="step-num">{index + 1}</span>
                            <span className="step-name">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <form onSubmit={handleStatusChange} className="status-update-form" style={{ marginTop: "24px" }}>
                      <label className="input-group">
                        <span>Alterar Etapa do Processo:</span>
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                          {PIPELINE_STATUSES.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label} ({s.key})
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="input-group" style={{ marginTop: "12px" }}>
                        <span>Justificativa da Alteração (Opcional):</span>
                        <input
                          type="text"
                          placeholder="Ex: Documentação analisada e deferida pela comissão..."
                          value={statusJustificativa}
                          onChange={(e) => setStatusJustificativa(e.target.value)}
                        />
                      </label>

                      <button
                        type="submit"
                        className="primary-button"
                        disabled={statusUpdating || newStatus === company.status}
                        style={{ marginTop: "16px" }}
                      >
                        {statusUpdating ? "Salvando..." : "Atualizar Etapa do Processo"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ABA 3: MINUTA CONTRATUAL */}
              {activeTab === "minuta" && (
                <div className="detail-tab-pane">
                  <div className="detail-section-card">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3>Termo de Afiliação</h3>
                        <p className="subheading">
                          {company.residente === false
                            ? "Modelo oficial para Não Residentes em PDF (DOCX)"
                            : "Modelo padrão para Residentes"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => setContractModalOpen(true)}
                      >
                        {activeContrato ? "Visualizar / Regerar Minuta" : "Gerar Minuta Contratual"}
                      </button>
                    </div>

                    {activeContrato ? (
                      <div className="active-contract-summary">
                        <div className="detail-grid">
                          <div>
                            <span>Número do Termo:</span>
                            <strong>{activeContrato.numeroTermo || "TERMO-EXTERNO"}</strong>
                          </div>
                          <div>
                            <span>Valor da Anuidade:</span>
                            <strong>
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                                activeContrato.valorAnuidade || 3600
                              )}
                            </strong>
                          </div>
                          <div>
                            <span>Status da Minuta:</span>
                            <span className="status active">✓ {activeContrato.status || "GERADO"}</span>
                          </div>
                          <div>
                            <span>Formato:</span>
                            <strong>{activeContrato.conteudoGerado?.startsWith("[PDF GERADO]") ? "PDF / DOCX" : "Texto Markdown"}</strong>
                          </div>
                        </div>

                        {activeContrato.conteudoGerado?.startsWith("[PDF GERADO]") && (
                          <div style={{ marginTop: "18px" }}>
                            <a
                              href={getStaticUrl(activeContrato.conteudoGerado.replace("[PDF GERADO]", "").trim())}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="secondary-button"
                            >
                              ↓ Baixar Arquivo da Minuta Oficial
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-state">
                        Nenhuma minuta gerada ainda para esta empresa. Clique em &quot;Gerar Minuta Contratual&quot;.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ABA 4: SIGNATÁRIOS (PROCURADORIA & REITORIA) */}
              {activeTab === "assinaturas" && (
                <div className="detail-tab-pane">
                  <div className="detail-section-card">
                    <h3>Checklist das 5 Assinaturas Obrigatórias</h3>
                    <p className="subheading" style={{ marginBottom: "16px" }}>
                      Acompanhamento de formalização do termo e registro de retorno da Procuradoria Jurídica.
                    </p>

                    <div className="signatures-list">
                      {assinaturas.length === 0 ? (
                        <div className="empty-state">Nenhum signatário registrado no checklist.</div>
                      ) : (
                        assinaturas.map((ass) => (
                          <div key={ass.id || ass.signatarioTipo} className="signature-row-item">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className={`signature-checkbox ${ass.assinado ? "checked" : ""}`}
                                onClick={() => handleToggleSignature(ass)}
                                aria-label={`Marcar assinatura de ${ass.nome}`}
                              >
                                {ass.assinado ? "✓" : ""}
                              </button>
                              <div>
                                <strong>{ass.nome || ass.signatarioTipo}</strong>
                                <small style={{ display: "block", color: "#8b9991" }}>
                                  {ass.cargo} • {ass.email}
                                </small>
                              </div>
                            </div>
                            <div>
                              <span className={`status ${ass.assinado ? "active" : "pending"}`}>
                                {ass.assinado ? "✓ Assinado" : "Pendente"}
                              </span>
                              {ass.dataAssinatura && (
                                <small style={{ display: "block", textAlign: "right", color: "#8a968f", marginTop: "2px" }}>
                                  {new Date(ass.dataAssinatura).toLocaleDateString("pt-BR")}
                                </small>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 5: DOCUMENTOS ANEXOS */}
              {activeTab === "documentos" && (
                <div className="detail-tab-pane">
                  <div className="detail-section-card">
                    <h3>Anexar Novo Documento</h3>
                    <form onSubmit={handleDocumentUpload} className="doc-upload-inline">
                      <select value={uploadTipo} onChange={(e) => setUploadTipo(e.target.value)}>
                        <option value="CONTRATO_SOCIAL">Contrato Social</option>
                        <option value="CARTAO_CNPJ">Cartão CNPJ</option>
                        <option value="CERTIDAO_NEGATIVA">Certidão Negativa</option>
                        <option value="DOC_REPRESENTANTE">Documento do Representante</option>
                        <option value="MINUTA_ASSINADA">Minuta Assinada</option>
                        <option value="OUTROS">Outros Documentos</option>
                      </select>

                      <input
                        type="file"
                        required
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />

                      <button type="submit" className="primary-button" disabled={uploading || !uploadFile}>
                        {uploading ? "Enviando..." : "Anexar"}
                      </button>
                    </form>

                    <h3 style={{ marginTop: "24px" }}>Documentos e Minutas Cadastradas</h3>
                    <div className="documents-table-wrap" style={{ marginTop: "12px" }}>
                      {documentos.length === 0 ? (
                        <div className="empty-state">Nenhum documento anexado.</div>
                      ) : (
                        <table>
                          <thead>
                            <tr>
                              <th>TIPO</th>
                              <th>ARQUIVO</th>
                              <th>CONFERÊNCIA</th>
                              <th>AÇÕES</th>
                            </tr>
                          </thead>
                          <tbody>
                            {documentos.map((doc) => {
                              const isMinuta = doc.tipo === "MINUTA_ASSINADA";
                              return (
                                <tr key={doc.id}>
                                  <td>
                                    <strong style={{ color: isMinuta ? "#3d7057" : "inherit" }}>
                                      {doc.tipo} {isMinuta ? "★" : ""}
                                    </strong>
                                  </td>
                                  <td>
                                    {doc.caminhoArquivo ? (
                                      <a
                                        href={getStaticUrl(doc.caminhoArquivo)}
                                        download
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-button"
                                      >
                                        {doc.nomeOriginal || "Baixar arquivo ↗"}
                                      </a>
                                    ) : (
                                      doc.nomeOriginal || "Arquivo registrado"
                                    )}
                                  </td>
                                  <td>
                                    <span className={`status ${doc.statusConferencia === "APROVADO" ? "active" : doc.statusConferencia === "REJEITADO" ? "pending" : "analysis"}`}>
                                      {doc.statusConferencia || "PENDENTE"}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        className="text-button"
                                        style={{ color: "#3d7057" }}
                                        onClick={() => handleDocumentStatus(doc.id, "APROVADO")}
                                      >
                                        Aprovar
                                      </button>
                                      <button
                                        type="button"
                                        className="text-button"
                                        style={{ color: "#c6755c" }}
                                        onClick={() => handleDocumentStatus(doc.id, "REJEITADO")}
                                      >
                                        Rejeitar
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 6: FINANCEIRO */}
              {activeTab === "financeiro" && (
                <div className="detail-tab-pane">
                  <div className="detail-section-card">
                    <h3>Cobranças e Anuidade</h3>
                    <div className="finance-table-wrap" style={{ marginTop: "12px" }}>
                      {faturas.length === 0 ? (
                        <div className="empty-state">Nenhum lançamento financeiro registrado.</div>
                      ) : (
                        <table>
                          <thead>
                            <tr>
                              <th>VALOR</th>
                              <th>VENCIMENTO</th>
                              <th>NF / BOLETO</th>
                              <th>STATUS</th>
                              <th>BAIXA</th>
                            </tr>
                          </thead>
                          <tbody>
                            {faturas.map((fat) => (
                              <tr key={fat.id}>
                                <td>
                                  <strong>
                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(fat.valor || 0)}
                                  </strong>
                                </td>
                                <td>
                                  {fat.dataVencimento ? new Date(fat.dataVencimento).toLocaleDateString("pt-BR") : "—"}
                                </td>
                                <td>{fat.numeroBoleto || fat.numeroNf || "—"}</td>
                                <td>
                                  <span className={`status ${fat.status === "PAGO" ? "active" : "payment"}`}>
                                    {fat.status === "PAGO" ? "✓ Pago" : "Pendente"}
                                  </span>
                                </td>
                                <td>
                                  {fat.status !== "PAGO" && (
                                    <button
                                      type="button"
                                      className="primary-button"
                                      style={{ padding: "4px 10px", fontSize: "10px" }}
                                      onClick={() => handleConfirmInvoicePayment(fat.id)}
                                    >
                                      Confirmar Pagamento
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="secondary-button" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </section>

      {/* Modal Aninhado de Minuta */}
      {contractModalOpen && (
        <ContractModal
          company={company}
          initialContract={activeContrato}
          onClose={() => setContractModalOpen(false)}
          onContractGenerated={(novoContrato) => {
            setCompanyData((prev) => ({
              ...prev,
              contratos: [novoContrato, ...(prev.contratos || []).filter((c) => c.id !== novoContrato.id)]
            }));
            if (onCompanyUpdated) {
              onCompanyUpdated({ ...company, status: "MINUTA_GERADA" });
            }
          }}
        />
      )}
    </div>
  );
}
