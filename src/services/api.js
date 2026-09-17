import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const unwrap = ({ data }) => data?.data ?? data;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pollen_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const demoUsers = {
  'demo@pollenparque.org.br': {
    name: 'Joana Silva',
    role: 'Equipe do programa',
    email: 'demo@pollenparque.org.br',
    avatar: 'JS',
    initialRoute: '/'
  },
  'empresa@biomacircular.com.br': {
    name: 'Rafael Nunes',
    role: 'Empresa afiliada',
    email: 'empresa@biomacircular.com.br',
    avatar: 'RN',
    companyId: 'affiliate-bioma-circular',
    companyName: 'Bioma Circular',
    initialRoute: '/portal-empresa'
  },
  'empresa@nexora.com.br': {
    name: 'Marina Costa',
    role: 'Empresa afiliada',
    email: 'empresa@nexora.com.br',
    avatar: 'MC',
    companyId: 'affiliate-nexora-tecnologia',
    companyName: 'Nexora Tecnologia',
    initialRoute: '/portal-empresa'
  },
  'financeiro@pollenparque.org.br': {
    name: 'Carlos Eduardo',
    role: 'Contabilidade / Financeiro',
    email: 'financeiro@pollenparque.org.br',
    avatar: 'CE',
    initialRoute: '/financeiro'
  }
};

export const api = {
  auth: {
    login: async (email, password) => {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const matchedUser = demoUsers[normalizedEmail];
      const isValid = (matchedUser && password === 'Pollen@2026') || (password === 'Pollen@2026' && normalizedEmail.includes('@'));

      if (!isValid) {
        const error = new Error('E-mail ou senha inválidos. Utilize a senha Pollen@2026.');
        error.response = { data: { message: error.message }, status: 401 };
        throw error;
      }

      const user = matchedUser || {
        name: normalizedEmail.startsWith('empresa') ? 'Representante Afiliada' : 'Usuário Pollen',
        role: normalizedEmail.startsWith('empresa') ? 'Empresa afiliada' : 'Equipe do programa',
        email: normalizedEmail,
        avatar: normalizedEmail.slice(0, 2).toUpperCase(),
        initialRoute: normalizedEmail.startsWith('empresa') ? '/portal-empresa' : '/'
      };

      const data = { token: `pollen-token-${Date.now()}`, user };
      if (typeof window !== 'undefined') {
        localStorage.setItem('pollen_token', data.token);
        localStorage.setItem('pollen_user', JSON.stringify(data.user));
      }
      return data;
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pollen_token');
        localStorage.removeItem('pollen_user');
      }
    },
    getCurrentUser: () => {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('pollen_user');
        return user ? JSON.parse(user) : null;
      }
      return null;
    },
    isAuthenticated: () => typeof window !== 'undefined' && Boolean(localStorage.getItem('pollen_token'))
  },

  portal: {
    getCompanyData: async (companyId = 'affiliate-bioma-circular') => {
      // Mock data com fallback inteligente e isolado para o Portal da Empresa
      return {
        company: {
          id: companyId,
          razaoSocial: 'Bioma Circular Soluções Sustentáveis Ltda.',
          nomeFantasia: 'Bioma Circular',
          cnpj: '48.912.345/0001-89',
          representanteNome: 'Rafael Nunes',
          emailContato: 'empresa@biomacircular.com.br',
          telefoneContato: '(49) 3321-8840',
          porte: 'Empresa de Médio Porte / Scale-up',
          categoria: 'Afiliada Residente e Tecnológica',
          status: 'Ativo',
          dataAdesao: '15/01/2026',
          endereco: 'Pollen Parque Científico Tecnológico - Bloco Inovação, Sala 204'
        },
        contract: {
          status: 'Vigente',
          numeroTermo: 'TERMO-AFF-2026/042',
          dataInicio: '20/01/2026',
          dataTermino: '19/01/2027',
          proximaRenovacao: '20/01/2027',
          diasRestantes: 124,
          valorAnuidadeAnual: 21600,
          formaPagamento: 'Mensalidade recorrente (12x de R$ 1.800,00)',
          procuradoriaStatus: 'Assinado e Homologado'
        },
        benefits: [
          {
            id: 'ben-lab',
            title: 'Laboratórios & Coworking',
            category: 'Infraestrutura',
            icon: '🔬',
            description: 'Acesso 24/7 às estações de trabalho e laboratórios com franquia de 40h/mês para a equipe técnica.',
            status: 'Ativo',
            badge: '40h / mês disponíveis'
          },
          {
            id: 'ben-rooms',
            title: 'Salas de Reunião & Videoconferência',
            category: 'Espaços',
            icon: '🏢',
            description: 'Reserva antecipada de salas equipadas com displays interativos e link de fibra ótica de 1 Gbps.',
            status: 'Ativo',
            badge: '10h mensais incluídas'
          },
          {
            id: 'ben-auditorio',
            title: 'Auditório e Espaço de Eventos',
            category: 'Eventos',
            icon: '🎤',
            description: '50% de desconto na locação do auditório principal para encontros técnicos, meetups e demonstrações.',
            status: 'Ativo',
            badge: '50% de desconto'
          },
          {
            id: 'ben-mentoria',
            title: 'Rede de Mentores e Matchmaking',
            category: 'Conexões',
            icon: '💡',
            description: 'Sessões mensais de mentoria executiva, apoio em editais FINEP/FAPESC e conexão com empresas âncoras.',
            status: 'Ativo',
            badge: 'Sessões mensais'
          },
          {
            id: 'ben-fiscal',
            title: 'Endereço Fiscal e Comercial',
            category: 'Institucional',
            icon: '📍',
            description: 'Uso da sede do Pollen Parque como endereço fiscal, domicílio tributário e divulgação no portal oficial.',
            status: 'Ativo',
            badge: 'Incluído na anuidade'
          },
          {
            id: 'ben-cursos',
            title: 'Workshops & Capacitação',
            category: 'Educação',
            icon: '🎓',
            description: 'Desconto de até 30% em cursos de extensão e programas executivos de inovação da rede associada.',
            status: 'Ativo',
            badge: '30% off'
          }
        ],
        pendingDocuments: [
          {
            id: 'doc-cnd-01',
            tipo: 'Certidão Negativa de Débitos Federais (CND)',
            situacao: 'Pendente de envio',
            statusClass: 'pending',
            dataExigencia: '10/09/2026',
            validade: 'Vencida recentemente',
            obrigatorio: true,
            instrucao: 'Por favor, envie a CND atualizada emitida pela Receita Federal.'
          },
          {
            id: 'doc-relatorio-02',
            tipo: 'Relatório Semestral de Inovação',
            situacao: 'Em análise pela equipe',
            statusClass: 'analysis',
            dataExigencia: '01/09/2026',
            validade: '2026.1',
            obrigatorio: false,
            instrucao: 'Enviado em 05/09/2026. Aguardando validação da coordenação.'
          },
          {
            id: 'doc-contrato-social',
            tipo: 'Contrato Social Consolidado',
            situacao: 'Aprovado',
            statusClass: 'active',
            dataExigencia: '15/01/2026',
            validade: 'Vigente',
            obrigatorio: true,
            instrucao: 'Documento conferido e aprovado.'
          },
          {
            id: 'doc-termo-assinado',
            tipo: 'Termo de Adesão Pollen Parque',
            situacao: 'Aprovado',
            statusClass: 'active',
            dataExigencia: '20/01/2026',
            validade: 'Vigente até Jan/2027',
            obrigatorio: true,
            instrucao: 'Assinatura digital autenticada.'
          }
        ],
        payments: [
          {
            id: 'pay-2026-09',
            competencia: '09/2026',
            tipo: 'Parcela da Anuidade',
            valor: 1800,
            vencimento: '25/09/2026',
            status: 'Aguardando pagamento',
            statusClass: 'payment',
            linhaDigitavel: '23793.38128 60000.123456 01000.654321 8 98450000180000',
            nfNumero: 'NF-e 004812',
            boletoUrl: '#',
            diasAteVencimento: 8
          },
          {
            id: 'pay-2026-09-extra',
            competencia: '09/2026',
            tipo: 'Locação Adicional de Sala de Treinamento',
            valor: 450,
            vencimento: '30/09/2026',
            status: 'Aguardando pagamento',
            statusClass: 'payment',
            linhaDigitavel: '23793.38128 60000.789012 01000.987654 3 98500000045000',
            nfNumero: 'NF-e 004835',
            boletoUrl: '#',
            diasAteVencimento: 13
          },
          {
            id: 'pay-2026-08',
            competencia: '08/2026',
            tipo: 'Parcela da Anuidade',
            valor: 1800,
            vencimento: '25/08/2026',
            status: 'Pago',
            statusClass: 'active',
            dataPagamento: '24/08/2026',
            nfNumero: 'NF-e 004590',
            comprovante: 'Autenticação Bancária #881293'
          },
          {
            id: 'pay-2026-07',
            competencia: '07/2026',
            tipo: 'Parcela da Anuidade',
            valor: 1800,
            vencimento: '25/07/2026',
            status: 'Pago',
            statusClass: 'active',
            dataPagamento: '23/07/2026',
            nfNumero: 'NF-e 004312',
            comprovante: 'Autenticação Bancária #774102'
          }
        ]
      };
    }
  },

  companies: {
    list: async (params = {}) => {
      const response = await apiClient.get('/companies', { params });
      return unwrap(response);
    },
    getById: async (id) => {
      return unwrap(await apiClient.get(`/companies/${id}`));
    },
    create: async (companyData) => {
      return unwrap(await apiClient.post('/companies', companyData));
    },
    update: async (id, companyData) => {
      return unwrap(await apiClient.put(`/companies/${id}`, companyData));
    },
    updateStatus: async (id, status, justificativa) => {
      return unwrap(await apiClient.patch(`/companies/${id}/status`, { status, justificativa }));
    },
    generateContract: async (id, contractData = {}) => {
      return unwrap(await apiClient.post(`/companies/${id}/contract/generate`, contractData));
    },
    remove: async (id) => {
      return unwrap(await apiClient.delete(`/companies/${id}`));
    }
  },

  finance: {
    list: async (params = {}) => {
      return unwrap(await apiClient.get('/financial/invoices', { params }));
    },
    create: async (recordData) => {
      return unwrap(await apiClient.post('/financial/invoices', recordData));
    },
    confirmPayment: async (id, paymentData = {}) => {
      return unwrap(await apiClient.patch(`/financial/invoices/${id}/payment`, paymentData));
    }
  },

  documents: {
    list: async (companyId) => {
      return unwrap(await apiClient.get(`/companies/${companyId}/documents`));
    },
    upload: async (companyId, file, kind) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', kind);
      return unwrap(await apiClient.post(`/companies/${companyId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }));
    },
    updateStatus: async (documentId, statusConferencia, justificativaRejeicao) => unwrap(await apiClient.patch(`/documents/${documentId}/status`, { statusConferencia, justificativaRejeicao })),
    remove: async (documentId) => unwrap(await apiClient.delete(`/documents/${documentId}`))
  },

  emails: {
    list: async () => {
      return unwrap(await apiClient.get('/communications/emails'));
    },
    send: async (emailData) => {
      return unwrap(await apiClient.post('/communications/emails', emailData));
    }
  },

  dashboard: {
    metrics: async () => unwrap(await apiClient.get('/dashboard/metrics'))
  },

  spaces: {
    list: async (params = {}) => unwrap(await apiClient.get('/spaces', { params })),
    create: async (spaceData) => unwrap(await apiClient.post('/spaces', spaceData)),
    update: async (id, spaceData) => unwrap(await apiClient.put(`/spaces/${id}`, spaceData)),
    remove: async (id) => unwrap(await apiClient.delete(`/spaces/${id}`))
  },

  signatures: {
    list: async (companyId) => unwrap(await apiClient.get(`/companies/${companyId}/signatures`)),
    update: async (companyId, type, signatureData) => unwrap(await apiClient.put(`/companies/${companyId}/signatures/${type}`, signatureData))
  },

  public: {
    register: async (companyData) => unwrap(await apiClient.post('/public/register', companyData))
  }
};
