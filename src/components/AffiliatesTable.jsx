"use client";

import { useMemo, useState } from "react";
import CrudModal from "./CrudModal";
import { affiliateFilters, affiliates } from "../app/dashboard-data";

const affiliateFields = [
  { name: "name", label: "Razão social", placeholder: "Nome da empresa" },
  { name: "contact", label: "Responsável", placeholder: "Nome do contato" },
  { name: "status", label: "Etapa atual", type: "select", options: ["Inscrição recebida", "Em análise", "Documentação pendente", "Contrato em preparação", "Aguardando pagamento", "Ativo"] },
];

const statusClasses = { "Inscrição recebida": "analysis", "Em análise": "analysis", "Documentação pendente": "pending", "Contrato em preparação": "contract", "Aguardando pagamento": "payment", Ativo: "active" };

function getInitials(name) {
  return name.split(" ").slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export default function AffiliatesTable({ compact = false, createSignal = 0 }) {
  const [records, setRecords] = useState(affiliates);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const filteredAffiliates = useMemo(() => records.filter((affiliate) => {
    const matchesQuery = `${affiliate.name} ${affiliate.contact}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = activeFilter === "Todos"
      || (activeFilter === "Pendências" && affiliate.status === "Documentação pendente")
      || (activeFilter === "Ativos" && affiliate.status === "Ativo")
      || affiliate.status === activeFilter;
    return matchesQuery && matchesFilter;
  }), [activeFilter, query, records]);

  function openCreate() {
    setEditingRecord(null);
    setModalOpen(true);
  }

  function openEdit(affiliate) {
    setEditingRecord(affiliate);
    setModalOpen(true);
  }

  function saveAffiliate(formData) {
    const record = { ...formData, id: formData.id || `${Date.now()}`, initials: getInitials(formData.name), statusClass: statusClasses[formData.status] || "analysis", updated: "Agora" };
    setRecords((current) => formData.id ? current.map((affiliate) => affiliate.id === formData.id ? record : affiliate) : [record, ...current]);
    setModalOpen(false);
  }

  function deleteAffiliate(formData) {
    setRecords((current) => current.filter((affiliate) => affiliate.id !== formData.id));
    setModalOpen(false);
  }

  return <><section className="panel affiliates-panel" id="afiliadas"><div className="panel-heading affiliates-heading"><div><p className="eyebrow">BASE DE AFILIADAS</p><h2>{compact ? "Empresas recentes" : "Todas as afiliadas"}</h2></div><div className="panel-actions"><button className="text-button" id="new-affiliate-button" type="button" onClick={openCreate}>+ Nova afiliada</button><button className="text-button" type="button">Exportar <span>↓</span></button></div></div><div className="toolbar"><div className="search-box"><span>⌕</span><input aria-label="Buscar empresa" placeholder="Buscar por empresa ou responsável" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="filter-list">{affiliateFilters.map((filter) => <button key={filter} className={activeFilter === filter ? "filter active" : "filter"} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div></div><div className="table-wrap"><table><thead><tr><th>EMPRESA</th><th>ETAPA ATUAL</th><th>ÚLTIMA ATUALIZAÇÃO</th><th /></tr></thead><tbody>{filteredAffiliates.map((affiliate) => <tr key={affiliate.id || affiliate.name}><td><div className="company-cell"><span className="avatar">{affiliate.initials}</span><span><strong>{affiliate.name}</strong><small>{affiliate.contact}</small></span></div></td><td><span className={`status ${affiliate.statusClass}`}>{affiliate.status}</span></td><td className="date-cell">{affiliate.updated}</td><td><button className="row-action" aria-label={`Editar ${affiliate.name}`} onClick={() => openEdit(affiliate)}>✎</button></td></tr>)}</tbody></table>{filteredAffiliates.length === 0 && <div className="empty-state">Nenhuma afiliada encontrada.</div>}</div></section>{modalOpen && <CrudModal title="Afiliada" fields={affiliateFields} initialData={editingRecord || { status: "" }} onClose={() => setModalOpen(false)} onSave={saveAffiliate} onDelete={editingRecord ? deleteAffiliate : undefined} />}</>;
}
