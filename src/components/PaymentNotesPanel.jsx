"use client";

import { useState } from "react";
import Pagination from "./Pagination";

const initialNotes = [
  { id: "note-1", company: "Verde Norte Energia", number: "NF 00482", competence: "09/2026", amount: "R$ 2.200,00", fileName: "nf-00482.pdf", status: "Enviada" },
  { id: "note-2", company: "Atlas Mobilidade", number: "NF 00477", competence: "09/2026", amount: "R$ 2.200,00", fileName: "nf-00477.xml", status: "Aguardando conferência" },
];

const companies = ["Selecione a empresa", "Verde Norte Energia", "Atlas Mobilidade", "Nexora Tecnologia", "Bioma Circular", "Cais Internacional"];
const acceptedFileTypes = ["application/pdf", "application/xml", "text/xml"];
const acceptedFileExtensions = [".pdf", ".xml"];
const maxFileSize = 10 * 1024 * 1024;

export default function PaymentNotesPanel() {
  const [notes, setNotes] = useState(initialNotes);
  const [formData, setFormData] = useState({ company: "", number: "", competence: "09/2026", amount: "", fileName: "" });
  const [feedback, setFeedback] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const totalPages = Math.max(1, Math.ceil(notes.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleNotes = notes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function updateField(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
    setFeedback("");
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const isAcceptedType = acceptedFileTypes.includes(file.type) || acceptedFileExtensions.includes(fileExtension);
    if (!isAcceptedType) {
      updateField("fileName", "");
      setFeedback("Selecione um arquivo PDF ou XML.");
      event.target.value = "";
      return;
    }
    if (file.size > maxFileSize) {
      updateField("fileName", "");
      setFeedback("O arquivo deve ter no máximo 10 MB.");
      event.target.value = "";
      return;
    }
    updateField("fileName", file.name);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.company || !formData.number || !formData.amount || !formData.fileName) {
      setFeedback("Preencha os campos obrigatórios e selecione o arquivo da nota.");
      return;
    }
    setNotes((current) => [{ ...formData, id: `note-${Date.now()}`, status: "Aguardando envio" }, ...current]);
    setPage(1);
    setFormData({ company: "", number: "", competence: "09/2026", amount: "", fileName: "" });
    setFeedback("Nota adicionada à fila local de envio.");
  }

  return <section className="payment-notes-grid"><div className="panel payment-upload-panel"><div className="panel-heading"><div><p className="eyebrow">NOTAS FISCAIS</p><h2>Enviar nota de pagamento</h2></div><span className="attention-badge">Mock local</span></div><p className="panel-description">Anexe a nota fiscal relacionada ao pagamento da afiliada. O envio real dependerá da integração com o backend.</p><form className="payment-form" onSubmit={handleSubmit}><label>Empresa <span>*</span><select value={formData.company} onChange={(event) => updateField("company", event.target.value)}><option value="">Selecione a empresa</option>{companies.slice(1).map((company) => <option value={company} key={company}>{company}</option>)}</select></label><div className="payment-form-row"><label>Número da nota <span>*</span><input value={formData.number} onChange={(event) => updateField("number", event.target.value)} placeholder="NF 00000" /></label><label>Competência <span>*</span><input value={formData.competence} onChange={(event) => updateField("competence", event.target.value)} placeholder="MM/AAAA" /></label></div><label>Valor <span>*</span><input value={formData.amount} onChange={(event) => updateField("amount", event.target.value)} placeholder="R$ 0,00" /></label><label className="file-dropzone"><span className="file-icon">↑</span><strong>{formData.fileName || "Selecione o arquivo da nota"}</strong><small>PDF ou XML até 10 MB</small><input type="file" accept=".pdf,.xml,application/pdf,application/xml,text/xml" onChange={handleFileChange} /></label>{feedback && <p className={feedback.startsWith("Nota") ? "form-feedback success" : "form-feedback error"} role="status">{feedback}</p>}<button className="primary-button" type="submit">Adicionar nota</button></form></div><div className="panel payment-history-panel"><div className="panel-heading"><div><p className="eyebrow">HISTÓRICO RECENTE</p><h2>Notas enviadas</h2></div><span className="notes-count">{notes.length}</span></div><div className="notes-list">{visibleNotes.map((note) => <article className="note-item" key={note.id}><span className="note-file">{note.fileName.endsWith(".xml") ? "XML" : "PDF"}</span><div><strong>{note.number} · {note.company}</strong><small>{note.fileName} · {note.competence} · {note.amount}</small></div><span className={`note-status ${note.status === "Enviada" ? "sent" : "waiting"}`}>{note.status}</span></article>)}</div><Pagination page={currentPage} pageSize={pageSize} totalItems={notes.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} /></div></section>;
}
