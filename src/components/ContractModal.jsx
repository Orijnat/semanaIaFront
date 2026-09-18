"use client";

import { useState } from "react";
import { getStaticUrl, api } from "../services/api";

export default function ContractModal({
  company,
  initialContract = null,
  onClose,
  onContractGenerated
}) {
  const [contrato, setContrato] = useState(initialContract);
  const [valorAnuidade, setValorAnuidade] = useState(initialContract?.valorAnuidade || "3600.00");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const conteudo = contrato?.conteudoGerado || contrato?.conteudo_gerado || "";
  const isPdfFlag = conteudo.startsWith("[PDF GERADO]");

  let rawFilePath = "";
  let fileUrl = "";
  let isDocx = false;

  if (isPdfFlag) {
    rawFilePath = conteudo.replace("[PDF GERADO]", "").trim();
    fileUrl = getStaticUrl(rawFilePath);
    isDocx = rawFilePath.toLowerCase().endsWith(".docx");
  }

  async function handleGenerate() {
    setError("");
    setSuccessMsg("");
    setGenerating(true);

    try {
      const payload = {
        valorAnuidade: parseFloat(valorAnuidade) || 3600.00
      };
      const result = await api.companies.generateContract(company.id, payload);
      setContrato(result);
      setSuccessMsg("Minuta contratual gerada com sucesso!");
      if (onContractGenerated) onContractGenerated(result);
    } catch (err) {
      console.error("Erro ao gerar minuta:", err);
      // Fallback amigável de demonstração caso a API esteja offline
      if (!err.response) {
        const mockContrato = {
          id: `mock-contract-${Date.now()}`,
          empresaId: company.id,
          numeroTermo: `TERMO-EXTERNO/${new Date().getFullYear()}/${company.id?.slice(0, 8) || "DEMO"}`,
          titulo: `Contrato de Afiliação — ${company.razaoSocial || company.name || "Afiliada"}`,
          conteudoGerado: company.residente === false
            ? `[PDF GERADO] /uploads/contratos/contrato_${company.id || "demo"}.pdf`
            : `# TERMO DE AFILIAÇÃO AO PROGRAMA POLLEN PARQUE\n\nPelo presente instrumento particular, de um lado o POLLEN PARQUE CIENTÍFICO E TECNOLÓGICO, e de outro a empresa **${company.razaoSocial || company.name}**, portadora do CNPJ ${company.cnpj || "Não informado"}...\n\n### CLÁUSULA PRIMEIRA - DO OBJETO\nO presente termo formaliza a afiliação da empresa ao ecossistema de inovação, estabelecendo anuidade no valor de R$ ${valorAnuidade}.\n\nData: ${new Date().toLocaleDateString("pt-BR")}`,
          valorAnuidade: valorAnuidade,
          status: "GERADO",
          createdAt: new Date().toISOString()
        };
        setContrato(mockContrato);
        setSuccessMsg("Minuta gerada (modo demonstrativo)!");
        if (onContractGenerated) onContractGenerated(mockContrato);
      } else {
        setError(err.response?.data?.message || "Falha ao gerar minuta contratual.");
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="crud-modal contract-modal" role="dialog" aria-modal="true" aria-labelledby="contract-modal-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">GESTÃO DE MINUTAS & CONTRATOS</p>
            <h2 id="contract-modal-title">
              Minuta Contratual — {company?.razaoSocial || company?.name || "Empresa"}
            </h2>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar modal">×</button>
        </div>

        <div className="contract-modal-body">
          {/* Informações da Empresa e Geração */}
          <div className="contract-header-info">
            <div className="contract-status-pills">
              <span className={`badge-tag ${company?.residente === false ? "externa" : "residente"}`}>
                {company?.residente === false ? "Empresa Não Residente (Externa)" : "Empresa Residente"}
              </span>
              {contrato && (
                <span className="status active">
                  ✓ Minuta: {contrato.numeroTermo || "Gerada"}
                </span>
              )}
            </div>

            <div className="generate-contract-toolbar">
              <label className="anuidade-input-group">
                <span>Valor da Anuidade (R$):</span>
                <input
                  type="number"
                  step="0.01"
                  value={valorAnuidade}
                  onChange={(e) => setValorAnuidade(e.target.value)}
                  placeholder="3600.00"
                  disabled={generating}
                />
              </label>

              <button
                type="button"
                className="primary-button"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? "Gerando Minuta..." : contrato ? "Regerar Minuta" : "Gerar Minuta Contratual"}
              </button>
            </div>
          </div>

          {error && <div className="form-feedback error" style={{ padding: "10px", margin: "10px 0" }}>⚠️ {error}</div>}
          {successMsg && <div className="form-feedback success" style={{ padding: "10px", margin: "10px 0" }}>✓ {successMsg}</div>}

          {/* Área de Visualização do Contrato */}
          {!contrato ? (
            <div className="empty-contract-state">
              <span style={{ fontSize: "38px" }}>📄</span>
              <strong>Nenhuma minuta contratual gerada ainda</strong>
              <p>Clique em &quot;Gerar Minuta Contratual&quot; para preencher o modelo oficial com os dados da empresa.</p>
            </div>
          ) : isPdfFlag ? (
            /* Visualizador para Não Residentes (PDF ou Fallback DOCX) */
            <div className="pdf-viewer-container">
              {isDocx ? (
                <div className="docx-fallback-banner">
                  <div className="docx-badge">📄 DOCX</div>
                  <div>
                    <strong>Minuta gerada em formato Word (.docx)</strong>
                    <p>O documento foi gerado preenchendo todos os marcadores do modelo. Baixe o arquivo para abrir no LibreOffice ou Microsoft Word.</p>
                  </div>
                  <a
                    href={fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-button"
                  >
                    ↓ Baixar Minuta (.docx)
                  </a>
                </div>
              ) : (
                <div className="pdf-frame-wrapper">
                  <div className="pdf-frame-actions">
                    <span>Visualização prévia do PDF:</span>
                    <a
                      href={fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-button"
                    >
                      Abrir em nova aba / Baixar PDF ↗
                    </a>
                  </div>
                  <iframe
                    src={fileUrl}
                    title="Visualização da Minuta Contratual em PDF"
                    className="contract-pdf-iframe"
                  />
                </div>
              )}

              <div className="pdf-footer-actions">
                <a
                  href={fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-button download-btn"
                >
                  ↓ Baixar Minuta Contratual Oficial ({isDocx ? "DOCX" : "PDF"})
                </a>
              </div>
            </div>
          ) : (
            /* Visualizador Markdown para Residentes */
            <div className="markdown-viewer-container">
              <div className="markdown-header-bar">
                <span>Visualização da Minuta em Texto (Residente)</span>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(conteudo);
                      alert("Texto da minuta copiado para a área de transferência!");
                    }
                  }}
                >
                  Copiar Texto
                </button>
              </div>
              <pre className="markdown-content-box">
                {conteudo}
              </pre>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="secondary-button" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}

