"use client";

import { useState } from "react";
import AppShell from "./AppShell";
import CrudModal from "./CrudModal";

const definitions = {
  documentos: { label: "Documento", fields: [{ name: "title", label: "Nome do documento" }, { name: "description", label: "Detalhes", type: "textarea" }, { name: "status", label: "Situação", type: "select", options: ["Pendente", "Recebido", "Válido", "Vencido"] }] },
  financeiro: { label: "Lançamento financeiro", fields: [{ name: "title", label: "Empresa" }, { name: "description", label: "Descrição", type: "textarea" }, { name: "status", label: "Situação", type: "select", options: ["Em aberto", "Pago", "Vencido"] }] },
  comunicacoes: { label: "Comunicação", fields: [{ name: "title", label: "Destinatário" }, { name: "description", label: "Resumo", type: "textarea" }, { name: "status", label: "Situação", type: "select", options: ["Rascunho", "Enviada", "Aguardando retorno"] }] },
  configuracoes: { label: "Configuração", fields: [{ name: "title", label: "Nome da configuração" }, { name: "description", label: "Descrição", type: "textarea" }, { name: "status", label: "Situação", type: "select", options: ["Ativa", "Inativa"] }] },
};

export default function SectionPage({ activePage, title, eyebrow, description, items }) {
  const definition = definitions[activePage] || definitions.configuracoes;
  const [records, setRecords] = useState(items);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  function saveRecord(formData) {
    const record = { ...formData, id: formData.id || `${Date.now()}`, icon: formData.icon || "□" };
    setRecords((current) => formData.id ? current.map((item) => item.id === formData.id ? record : item) : [record, ...current]);
    setModalOpen(false);
  }

  function deleteRecord(formData) {
    setRecords((current) => current.filter((item) => item.id !== formData.id));
    setModalOpen(false);
  }

  return <AppShell activePage={activePage} breadcrumb={title}><div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="subheading">{description}</p></div><button className="primary-button" type="button" onClick={() => { setEditingRecord(null); setModalOpen(true); }}>+ <span>Nova entrada</span></button></section><section className="panel section-placeholder"><div className="panel-heading"><div><p className="eyebrow">REGISTROS</p><h2>{definition.label}s cadastrados</h2></div><span className="attention-badge">Mock</span></div><div className="section-list">{records.map((item) => <div className="section-list-item" key={item.id || item.title}><span className="attention-icon green">{item.icon}</span><span><strong>{item.title}</strong><small>{item.description}</small></span><button className="row-action" type="button" aria-label={`Editar ${item.title}`} onClick={() => { setEditingRecord(item); setModalOpen(true); }}>✎</button></div>)}</div></section></div>{modalOpen && <CrudModal title={definition.label} fields={definition.fields} initialData={editingRecord || {}} onClose={() => setModalOpen(false)} onSave={saveRecord} onDelete={editingRecord ? deleteRecord : undefined} />}</AppShell>;
}
