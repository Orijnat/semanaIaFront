"use client";

import { useEffect, useRef, useState } from "react";

export default function CrudModal({ title, fields, initialData, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState(() => ({ ...initialData }));
  const firstFieldRef = useRef(null);
  const previousActiveElement = useRef(null);
  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    previousActiveElement.current = document.activeElement;
    firstFieldRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("modal-open");
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElement.current?.isConnected) previousActiveElement.current.focus();
    };
  }, [onClose]);

  function updateField(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(formData);
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="crud-modal" role="dialog" aria-modal="true" aria-labelledby="crud-modal-title"><div className="modal-header"><div><p className="eyebrow">{isEditing ? "EDITAR REGISTRO" : "NOVO REGISTRO"}</p><h2 id="crud-modal-title">{title}</h2></div><button className="modal-close" type="button" onClick={onClose} aria-label="Fechar modal">×</button></div><form onSubmit={handleSubmit}><div className="modal-fields">{fields.map((field, index) => <label className="modal-field" key={field.name}>{field.label}{field.required !== false && <span aria-hidden="true">*</span>}{field.type === "textarea" ? <textarea ref={index === 0 ? firstFieldRef : undefined} required={field.required !== false} rows="3" value={formData[field.name] || ""} onChange={(event) => updateField(field.name, event.target.value)} placeholder={field.placeholder} /> : field.type === "select" ? <select ref={index === 0 ? firstFieldRef : undefined} required={field.required !== false} value={formData[field.name] || ""} onChange={(event) => updateField(field.name, event.target.value)}><option value="">Selecione</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input ref={index === 0 ? firstFieldRef : undefined} required={field.required !== false} type={field.type || "text"} value={formData[field.name] || ""} onChange={(event) => updateField(field.name, event.target.value)} placeholder={field.placeholder} />}</label>)}</div><div className="modal-footer">{isEditing && onDelete ? <button className="danger-button" type="button" onClick={() => onDelete(formData)}>Excluir</button> : <span /> }<div className="modal-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit">Salvar</button></div></div></form></section></div>;
}
