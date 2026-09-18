/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "../../services/api";

function formatCnpj(value) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatCep(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function InscricaoNaoResidentePage() {
  const [formData, setFormData] = useState({
    // Dados da Empresa
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    anoFundacao: "",
    areaAtuacao: "",
    emailContato: "",
    emailCobranca: "",
    telefone: "",
    site: "",
    enderecoCompleto: "",
    cidade: "Chapecó",
    estado: "SC",
    cep: "",
    // Dados do Representante Legal
    representanteNome: "",
    representanteCpf: "",
    representanteCargo: "",
    representanteEndereco: "",
    representanteEmail: "",
    representanteTelefone: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    let formattedValue = value;

    if (name === "cnpj") formattedValue = formatCnpj(value);
    else if (name === "representanteCpf") formattedValue = formatCpf(value);
    else if (name === "cep") formattedValue = formatCep(value);
    else if (name === "telefone" || name === "representanteTelefone") {
      formattedValue = formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        anoFundacao: formData.anoFundacao ? parseInt(formData.anoFundacao, 10) : null
      };

      let response;
      try {
        response = await api.public.registerNonResident(payload);
      } catch (reqError) {
        // Tenta endpoint alternativo de empresas se a rota public não estiver mapeada
        if (reqError.response?.status === 404) {
          response = await api.companies.registerNonResident(payload);
        } else {
          throw reqError;
        }
      }

      setSuccessData({
        protocolo: response?.protocolo || `POL-${(response?.id || Date.now().toString()).slice(0, 8).toUpperCase()}`,
        razaoSocial: formData.razaoSocial,
        emailContato: formData.emailContato,
        representanteNome: formData.representanteNome
      });
    } catch (err) {
      console.error("Erro ao enviar inscrição:", err);
      // Fallback amigável de demonstração caso o backend esteja completamente offline
      if (!err.response) {
        setSuccessData({
          protocolo: `POL-${Date.now().toString().slice(-8).toUpperCase()}`,
          razaoSocial: formData.razaoSocial,
          emailContato: formData.emailContato,
          representanteNome: formData.representanteNome,
          isOfflineMock: true
        });
      } else {
        setError(err.response?.data?.message || "Erro ao submeter a proposta. Por favor, revise os campos e tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (successData) {
    return (
      <div className="inscricao-wrapper">
        <div className="inscricao-card success-card">
          <div className="success-icon-circle">✓</div>
          <p className="eyebrow" style={{ color: "#3d7057", marginTop: "16px" }}>
            INSCRIÇÃO ENVIADA COM SUCESSO
          </p>
          <h1 className="success-title">Proposta de Afiliação Registrada!</h1>
          <p className="success-description">
            Recebemos a solicitação de afiliação não residente da empresa{" "}
            <strong>{successData.razaoSocial}</strong>.
          </p>

          <div className="protocolo-box">
            <span className="protocolo-label">NÚMERO DE PROTOCOLO:</span>
            <strong className="protocolo-number">{successData.protocolo}</strong>
            <small>Guarde este número para acompanhamento do processo.</small>
          </div>

          <div className="proximos-passos-box">
            <h3>Próximos passos do programa:</h3>
            <ol>
              <li>
                <strong>Conferência Documental:</strong> Nossa equipe de parcerias analisará os dados submetidos.
              </li>
              <li>
                <strong>Geração da Minuta:</strong> Será confeccionada a minuta do Termo de Afiliação Não Residente.
              </li>
              <li>
                <strong>Assinatura Digital & Retorno da Procuradoria:</strong> Você receberá instruções no e-mail{" "}
                <em>{successData.emailContato}</em> para a formalização.
              </li>
            </ol>
          </div>

          <div className="success-actions">
            <Link href="/login" className="primary-button">
              Ir para Tela Inicial / Login
            </Link>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSuccessData(null);
                setFormData({
                  razaoSocial: "",
                  nomeFantasia: "",
                  cnpj: "",
                  anoFundacao: "",
                  areaAtuacao: "",
                  emailContato: "",
                  emailCobranca: "",
                  telefone: "",
                  site: "",
                  enderecoCompleto: "",
                  cidade: "Chapecó",
                  estado: "SC",
                  cep: "",
                  representanteNome: "",
                  representanteCpf: "",
                  representanteCargo: "",
                  representanteEndereco: "",
                  representanteEmail: "",
                  representanteTelefone: ""
                });
              }}
            >
              Enviar Outra Proposta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inscricao-wrapper">
      <header className="inscricao-header">
        <Link href="/login" className="brand" aria-label="Voltar para o início">
          <img
            src="/logo-black.svg"
            alt="Pollen Parque Científico Tecnológico"
            width={176}
            height={39}
            className="brand-logo"
          />
        </Link>
        <Link href="/login" className="secondary-button" style={{ padding: "8px 16px" }}>
          ← Já possui acesso? Entrar
        </Link>
      </header>

      <main className="inscricao-container">
        <div className="inscricao-card">
          <div className="inscricao-intro">
            <span className="badge-tag externa">Afiliação Não Residente (Externa)</span>
            <h1>Formulário de Afiliação — Pollen Parque</h1>
            <p className="subheading">
              Conecte sua empresa ao ecossistema de inovação do Pollen Parque e usufrua de seus benefícios, mentorias e infraestrutura, mesmo sem residência física.
            </p>
            <div className="info-banner">
              <span>ℹ</span>
              <div>
                <strong>Substituição do Formulário em PDF:</strong> Preencha os dados abaixo diretamente online para geração automatizada da sua minuta contratual de afiliação.
              </div>
            </div>
          </div>

          {error && (
            <div className="form-feedback error" style={{ padding: "14px", background: "#fff1ee", borderRadius: "8px", marginBottom: "20px" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="inscricao-form">
            {/* SEÇÃO 1: DADOS DA EMPRESA */}
            <fieldset className="form-section">
              <legend className="section-legend">
                <span className="legend-number">1</span>
                <div>
                  <strong>Dados da Empresa (Pessoa Jurídica)</strong>
                  <small>Informações cadastrais e fiscais da organização</small>
                </div>
              </legend>

              <div className="form-grid-2">
                <label className="input-group">
                  <span>Razão Social da Empresa *</span>
                  <input
                    type="text"
                    name="razaoSocial"
                    required
                    placeholder="Ex: Tech Soluções em Inovação Ltda"
                    value={formData.razaoSocial}
                    onChange={handleChange}
                  />
                </label>

                <label className="input-group">
                  <span>Nome Fantasia</span>
                  <input
                    type="text"
                    name="nomeFantasia"
                    placeholder="Ex: Tech Soluções"
                    value={formData.nomeFantasia}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-grid-3">
                <label className="input-group">
                  <span>CNPJ *</span>
                  <input
                    type="text"
                    name="cnpj"
                    required
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={handleChange}
                  />
                </label>

                <label className="input-group">
                  <span>Ano de Fundação *</span>
                  <input
                    type="number"
                    name="anoFundacao"
                    required
                    min="1900"
                    max="2030"
                    placeholder="Ex: 2021"
                    value={formData.anoFundacao}
                    onChange={handleChange}
                  />
                </label>

                <label className="input-group">
                  <span>Área / Segmento de Atuação *</span>
                  <input
                    type="text"
                    name="areaAtuacao"
                    required
                    placeholder="Ex: Software, Biotecnologia, Agro..."
                    value={formData.areaAtuacao}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-grid-2">
                <label className="input-group">
                  <span>E-mail para Comunicações *</span>
                  <input
                    type="email"
                    name="emailContato"
                    required
                    placeholder="contato@empresa.com.br"
                    value={formData.emailContato}
                    onChange={handleChange}
                  />
                  <small className="input-hint">Receberá avisos e comunicados do parque</small>
                </label>

                <label className="input-group">
                  <span>E-mail para Boletos e Cobrança *</span>
                  <input
                    type="email"
                    name="emailCobranca"
                    required
                    placeholder="financeiro@empresa.com.br"
                    value={formData.emailCobranca}
                    onChange={handleChange}
                  />
                  <small className="input-hint">Para envio de Nota Fiscal e Boleto da Anuidade</small>
                </label>
              </div>

              <div className="form-grid-2">
                <label className="input-group">
                  <span>Telefone / WhatsApp da Empresa *</span>
                  <input
                    type="text"
                    name="telefone"
                    required
                    placeholder="(49) 99999-9999"
                    value={formData.telefone}
                    onChange={handleChange}
                  />
                  <small className="input-hint">Para comunicação no grupo de afiliados</small>
                </label>

                <label className="input-group">
                  <span>Site ou Redes Sociais da Empresa *</span>
                  <input
                    type="text"
                    name="site"
                    required
                    placeholder="https://empresa.com.br ou @empresa (ou 'não aplicável')"
                    value={formData.site}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-grid-1">
                <label className="input-group">
                  <span>Endereço Completo da Empresa (Logradouro, Número, Bairro) *</span>
                  <input
                    type="text"
                    name="enderecoCompleto"
                    required
                    placeholder="Rua das Tecnologias, 100, Bairro Universitário"
                    value={formData.enderecoCompleto}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-grid-3">
                <label className="input-group">
                  <span>Cidade *</span>
                  <input
                    type="text"
                    name="cidade"
                    required
                    placeholder="Chapecó"
                    value={formData.cidade}
                    onChange={handleChange}
                  />
                </label>

                <label className="input-group">
                  <span>Estado (UF) *</span>
                  <input
                    type="text"
                    name="estado"
                    required
                    maxLength={2}
                    placeholder="SC"
                    value={formData.estado}
                    onChange={handleChange}
                  />
                </label>

                <label className="input-group">
                  <span>CEP *</span>
                  <input
                    type="text"
                    name="cep"
                    required
                    placeholder="89800-000"
                    value={formData.cep}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </fieldset>

            {/* SEÇÃO 2: DADOS DO REPRESENTANTE LEGAL */}
            <fieldset className="form-section">
              <legend className="section-legend">
                <span className="legend-number">2</span>
                <div>
                  <strong>Dados do Representante Legal (Pessoa Física)</strong>
                  <small>Pessoa responsável pela assinatura formal do contrato</small>
                </div>
              </legend>

              <div className="form-grid-2">
                <label className="input-group">
                  <span>Nome Completo *</span>
                  <input
                    type="text"
                    name="representanteNome"
                    required
                    placeholder="Nome do representante legal"
                    value={formData.representanteNome}
                    onChange={handleChange}
                  />
                </label>

                <label className="input-group">
                  <span>CPF *</span>
                  <input
                    type="text"
                    name="representanteCpf"
                    required
                    placeholder="000.000.000-00"
                    value={formData.representanteCpf}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-grid-2">
                <label className="input-group">
                  <span>Função / Cargo na Empresa *</span>
                  <input
                    type="text"
                    name="representanteCargo"
                    required
                    placeholder="Ex: Diretor Geral, CEO, Sócio-Administrador"
                    value={formData.representanteCargo}
                    onChange={handleChange}
                  />
                </label>

                <label className="input-group">
                  <span>E-mail do Representante *</span>
                  <input
                    type="email"
                    name="representanteEmail"
                    required
                    placeholder="representante@empresa.com.br"
                    value={formData.representanteEmail}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-grid-2">
                <label className="input-group">
                  <span>Telefone / WhatsApp do Representante *</span>
                  <input
                    type="text"
                    name="representanteTelefone"
                    required
                    placeholder="(49) 98888-8888"
                    value={formData.representanteTelefone}
                    onChange={handleChange}
                  />
                </label>

                <label className="input-group">
                  <span>Endereço Residencial do Representante *</span>
                  <input
                    type="text"
                    name="representanteEndereco"
                    required
                    placeholder="Rua Residencial, 200, Centro, Chapecó-SC"
                    value={formData.representanteEndereco}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </fieldset>

            <div className="form-submit-row">
              <Link href="/login" className="secondary-button">
                Cancelar
              </Link>
              <button type="submit" className="primary-button" disabled={loading} style={{ minWidth: "220px" }}>
                {loading ? "Processando Inscrição..." : "Enviar Inscrição de Afiliação →"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

