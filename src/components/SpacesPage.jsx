"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "./AppShell";
import CrudModal from "./CrudModal";
import Pagination from "./Pagination";
import { api } from "../services/api";

const spaceFields = [
  { name: "name", label: "Nome do espaço", placeholder: "Ex.: Sala Ipê" },
  { name: "type", label: "Tipo", type: "select", options: ["SALA_PRIVATIVA", "COWORKING", "LABORATORIO"] },
  { name: "block", label: "Bloco", required: false },
  { name: "capacity", label: "Capacidade", type: "number", required: false },
  { name: "status", label: "Situação", type: "select", options: ["DISPONIVEL", "OCUPADO", "MANUTENCAO"] },
  { name: "notes", label: "Observações", type: "textarea", required: false }
];

const statusLabels = { DISPONIVEL: "Disponível", OCUPADO: "Ocupado", MANUTENCAO: "Em manutenção" };

function toSpaceRecord(space) {
  return { ...space, name: space.nome, type: space.tipo, block: space.bloco || "-", capacity: space.capacidade || 1, status: space.status, notes: space.observacoes || "", company: space.empresa?.nomeFantasia || space.empresa?.razaoSocial || "Livre" };
}

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  async function loadSpaces() {
    setLoading(true);
    try {
      const data = await api.spaces.list();
      setSpaces((data || []).map(toSpaceRecord));
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Não foi possível carregar os espaços.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    api.spaces.list().then((data) => {
      if (mounted) setSpaces((data || []).map(toSpaceRecord));
    }).catch((requestError) => {
      if (mounted) setError(requestError.response?.data?.message || "Não foi possível carregar os espaços.");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const filteredSpaces = useMemo(() => spaces.filter((space) => {
    const matchesQuery = `${space.name} ${space.block} ${space.company}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (statusFilter === "TODOS" || space.status === statusFilter);
  }), [query, spaces, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredSpaces.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleSpaces = filteredSpaces.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function saveSpace(formData) {
    try {
      const payload = { nome: formData.name, tipo: formData.type, bloco: formData.block, capacidade: Number(formData.capacity) || 1, status: formData.status || "DISPONIVEL", observacoes: formData.notes };
      if (formData.id) await api.spaces.update(formData.id, payload);
      else await api.spaces.create(payload);
      setModalOpen(false);
      await loadSpaces();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Não foi possível salvar o espaço.");
    }
  }

  async function deleteSpace(space) {
    try {
      await api.spaces.remove(space.id);
      setModalOpen(false);
      await loadSpaces();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Não foi possível excluir o espaço.");
    }
  }

  return <AppShell activePage="espacos" breadcrumb="Espaços físicos"><div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">INFRAESTRUTURA DO PARQUE</p><h1>Espaços físicos</h1><p className="subheading">Controle salas, coworkings e laboratórios disponíveis para as afiliadas.</p></div><button className="primary-button" type="button" onClick={() => { setEditingSpace(null); setModalOpen(true); }}>+ <span>Novo espaço</span></button></section><section className="panel spaces-panel"><div className="panel-heading"><div><p className="eyebrow">MAPA DE OCUPAÇÃO</p><h2>{filteredSpaces.length} espaços encontrados</h2></div><span className="attention-badge">API conectada</span></div><div className="spaces-toolbar"><div className="search-box"><span>⌕</span><input aria-label="Buscar espaço" placeholder="Buscar por espaço, bloco ou empresa" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></div><div className="filter-list">{["TODOS", "DISPONIVEL", "OCUPADO", "MANUTENCAO"].map((status) => <button className={statusFilter === status ? "filter active" : "filter"} key={status} type="button" onClick={() => { setStatusFilter(status); setPage(1); }}>{status === "TODOS" ? "Todos" : statusLabels[status]}</button>)}</div></div>{error && <p className="form-feedback error spaces-error" role="alert">{error}</p>}{loading ? <div className="empty-state">Carregando espaços...</div> : <div className="spaces-grid">{visibleSpaces.map((space) => <article className="space-card" key={space.id}><div className="space-card-top"><span className="space-icon">□</span><span className={`space-status ${space.status.toLowerCase()}`}>{statusLabels[space.status] || space.status}</span></div><h3>{space.name}</h3><p>{space.type.replaceAll("_", " ")} · Bloco {space.block}</p><div className="space-meta"><span>Capacidade <strong>{space.capacity}</strong></span><span>Empresa <strong>{space.company}</strong></span></div><button className="row-action" type="button" aria-label={`Editar ${space.name}`} onClick={() => { setEditingSpace(space); setModalOpen(true); }}>Editar</button></article>)}{visibleSpaces.length === 0 && <div className="empty-state">Nenhum espaço encontrado.</div>}</div>}<Pagination page={currentPage} pageSize={pageSize} totalItems={filteredSpaces.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} /></section></div>{modalOpen && <CrudModal title="Espaço físico" fields={spaceFields} initialData={editingSpace || {}} onClose={() => setModalOpen(false)} onSave={saveSpace} onDelete={editingSpace ? deleteSpace : undefined} />}</AppShell>;
}