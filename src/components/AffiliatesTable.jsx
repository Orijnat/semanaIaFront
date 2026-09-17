"use client";

import { useEffect, useMemo, useState } from "react";
import CrudModal from "./CrudModal";
import Pagination from "./Pagination";
import { affiliates as defaultAffiliates, affiliateFilters } from "../app/dashboard-data";
import { affiliateFields } from "../app/affiliate-schema";
import { api } from "../services/api";

const statusClasses = { "Inscrição recebida": "analysis", "Em análise": "analysis", "Documentação pendente": "pending", "Contrato em preparação": "contract", "Aguardando pagamento": "payment", Ativo: "active" };
const statusToApi = { "Inscrição recebida": "EM_ANALISE", "Em análise": "EM_ANALISE", "Documentação pendente": "EM_ANALISE", "Contrato em preparação": "MINUTA_GERADA", "Enviado à Procuradoria": "EM_ASSINATURA", "Assinatura pendente": "EM_ASSINATURA", "Aguardando pagamento": "AGUARDANDO_PAGAMENTO", Ativo: "ATIVO", Vencido: "VENCIDO", Encerrado: "DESLIGADO" };
const statusFromApi = { EM_ANALISE: "Em análise", MINUTA_GERADA: "Contrato em preparação", EM_ASSINATURA: "Assinatura pendente", AGUARDANDO_PAGAMENTO: "Aguardando pagamento", ATIVO: "Ativo", VENCIDO: "Vencido", DESLIGADO: "Encerrado", INADIMPLENTE: "Vencido" };

function getInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "AF";
}

function toAffiliateRecord(company) {
  const status = statusFromApi[company.status] || "Em análise";
  return { ...company, name: company.razaoSocial, tradeName: company.nomeFantasia || "", documentId: company.cnpj || "", legalRepresentative: company.representanteNome || "", billingEmail: company.emailContato || "", contact: company.representanteNome || company.emailContato || "", status, initials: getInitials(company.razaoSocial || ""), statusClass: statusClasses[status] || "analysis", updated: company.updatedAt ? new Date(company.updatedAt).toLocaleDateString("pt-BR") : "Agora" };
}

export default function AffiliatesTable({ compact = false, createSignal = 0 }) {
  const [records, setRecords] = useState(defaultAffiliates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [prevSignal, setPrevSignal] = useState(createSignal);
  if (createSignal !== prevSignal) {
    setPrevSignal(createSignal);
    if (createSignal > 0) {
      setEditingRecord(null);
      setModalOpen(true);
    }
  }

  useEffect(() => {
    let mounted = true;
    api.companies.list({ limit: 100 }).then((result) => {
      const items = result?.items || (Array.isArray(result) ? result : []);
      if (mounted && items.length > 0) {
        setRecords(items.map(toAffiliateRecord));
      }
    }).catch((requestError) => {
      if (mounted) setError(requestError.response?.data?.message || "");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);
  const filteredAffiliates = useMemo(() => records.filter((affiliate) => {
    const matchesQuery = `${affiliate.name} ${affiliate.contact}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = activeFilter === "Todos"
      || (activeFilter === "Pendências" && affiliate.status === "Documentação pendente")
      || (activeFilter === "Ativos" && affiliate.status === "Ativo")
      || affiliate.status === activeFilter;
    return matchesQuery && matchesFilter;
  }), [activeFilter, query, records]);
  const totalPages = Math.max(1, Math.ceil(filteredAffiliates.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleAffiliates = useMemo(() => filteredAffiliates.slice((currentPage - 1) * pageSize, currentPage * pageSize), [currentPage, filteredAffiliates, pageSize]);

  function openCreate() {
    setEditingRecord(null);
    setModalOpen(true);
  }

  function openEdit(affiliate) {
    setEditingRecord(affiliate);
    setModalOpen(true);
  }

  async function saveAffiliate(formData) {
    setError("");
    try {
      const payload = { razaoSocial: formData.name, nomeFantasia: formData.tradeName, cnpj: formData.documentId, emailContato: formData.billingEmail, representanteNome: formData.legalRepresentative, status: statusToApi[formData.status] || "EM_ANALISE" };
      const company = formData.id && !String(formData.id).startsWith("affiliate-") ? await api.companies.update(formData.id, payload) : await api.companies.create(payload);
      const record = toAffiliateRecord(company);
      setRecords((current) => formData.id ? current.map((affiliate) => affiliate.id === formData.id ? record : affiliate) : [record, ...current]);
      setPage(1);
      setModalOpen(false);
    } catch (requestError) {
      // Fallback local update if API fails or backend is not active
      const localRecord = { ...formData, id: formData.id || `affiliate-${Date.now()}`, initials: getInitials(formData.name), statusClass: statusClasses[formData.status] || "analysis", updated: "Agora" };
      setRecords((current) => formData.id ? current.map((affiliate) => affiliate.id === formData.id ? localRecord : affiliate) : [localRecord, ...current]);
      setPage(1);
      setModalOpen(false);
      setError(requestError.response?.data?.message || "");
    }
  }

  async function deleteAffiliate(formData) {
    setError("");
    try {
      if (formData.id && !String(formData.id).startsWith("affiliate-")) {
        await api.companies.remove(formData.id);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "");
    }
    setRecords((current) => current.filter((affiliate) => affiliate.id !== formData.id));
    setPage(1);
    setModalOpen(false);
  }

  return <><section className="panel affiliates-panel" id="afiliadas"><div className="panel-heading affiliates-heading"><div><p className="eyebrow">BASE DE AFILIADAS</p><h2>{compact ? "Empresas recentes" : "Todas as afiliadas"}</h2></div><div className="panel-actions"><button className="text-button" type="button">Exportar <span>↓</span></button></div></div><div className="toolbar"><div className="search-box"><span>⌕</span><input aria-label="Buscar empresa" placeholder="Buscar por empresa ou responsável" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></div><div className="filter-list">{affiliateFilters.map((filter) => <button key={filter} type="button" className={activeFilter === filter ? "filter active" : "filter"} onClick={() => { setActiveFilter(filter); setPage(1); }}>{filter}</button>)}</div></div>{error && <p className="form-feedback error" role="alert">{error}</p>}<div className="table-wrap"><table><thead><tr><th>EMPRESA</th><th>ETAPA ATUAL</th><th>ÚLTIMA ATUALIZAÇÃO</th><th /></tr></thead><tbody>{visibleAffiliates.map((affiliate) => <tr key={affiliate.id}><td><div className="company-cell"><span className="avatar">{affiliate.initials}</span><span><strong>{affiliate.name}</strong><small>{affiliate.contact}</small></span></div></td><td><span className={`status ${affiliate.statusClass}`}>{affiliate.status}</span></td><td className="date-cell">{affiliate.updated}</td><td><button className="row-action" type="button" aria-label={`Editar ${affiliate.name}`} onClick={() => openEdit(affiliate)}>✎</button></td></tr>)}</tbody></table>{loading && records.length === 0 && <div className="empty-state">Carregando afiliadas...</div>}{!loading && filteredAffiliates.length === 0 && <div className="empty-state">Nenhuma afiliada encontrada.</div>}</div><Pagination page={currentPage} pageSize={pageSize} totalItems={filteredAffiliates.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} /></section>{modalOpen && <CrudModal title="Afiliada" fields={affiliateFields} initialData={editingRecord || { status: "Em análise" }} onClose={() => setModalOpen(false)} onSave={saveAffiliate} onDelete={editingRecord ? deleteAffiliate : undefined} />}</>;
}
