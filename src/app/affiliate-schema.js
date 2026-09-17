export const affiliateFields = [
  { name: "name", label: "Razão social", placeholder: "Nome da empresa" },
  { name: "tradeName", label: "Nome fantasia", required: false },
  { name: "documentId", label: "CNPJ", required: false },
  { name: "legalRepresentative", label: "Representante legal", required: false },
  { name: "billingEmail", label: "E-mail para boletos", type: "email", required: false },
  { name: "contractSignedAt", label: "Data da assinatura do contrato", type: "date", required: false },
  { name: "planValue", label: "Enquadramento da empresa / valor", required: false },
  { name: "invoiceOrBoleto", label: "Nº NF / chave do boleto", required: false },
  { name: "boletoDueDate", label: "Vencimento do boleto", type: "date", required: false },
  { name: "paymentDate", label: "Data do pagamento", type: "date", required: false },
  { name: "nextChargeDate", label: "Data da próxima cobrança", type: "date", required: false },
  { name: "validFrom", label: "Início da vigência", type: "date", required: false },
  { name: "validUntil", label: "Final da vigência", type: "date", required: false },
  { name: "renewalReminder", label: "Lembrete de renovação", required: false },
  { name: "status", label: "Status", type: "select", options: ["Inscrição recebida", "Em análise", "Documentação pendente", "Contrato em preparação", "Enviado à Procuradoria", "Assinatura pendente", "Aguardando pagamento", "Ativo", "Vencido", "Encerrado"] },
  { name: "programValue", label: "Levantamento de valores do programa", required: false },
  { name: "contact", label: "Responsável pelo contato", required: false },
];

export const spreadsheetEntities = {
  benefits: ["number", "benefit"],
  brandExposure: ["number", "company", "telãoPollenParque", "sitePollenParque", "notes"],
  reservations: ["number", "company", "documentId", "aticoAnnual", "auditoriumAnnual", "coworkingAnnual", "reservationNotes"],
  contracts: affiliateFields.map((field) => field.name),
  materials: ["number", "company"],
  prospecting: ["number", "city", "company", "materialsEmail", "phone"],
};
