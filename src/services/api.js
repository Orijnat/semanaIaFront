import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

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
    name: 'Marcos Vinicius',
    role: 'Empresa afiliada',
    email: 'empresa@biomacircular.com.br',
    avatar: 'MV',
    companyId: '11111111-1111-1111-1111-111111111101',
    companyName: 'AgroTech',
    initialRoute: '/portal-empresa'
  },
  'empresa@nexora.com.br': {
    name: 'Renata Alcantara',
    role: 'Empresa afiliada',
    email: 'empresa@nexora.com.br',
    avatar: 'RA',
    companyId: '11111111-1111-1111-1111-111111111102',
    companyName: 'BioSaúde',
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
    getCompanyData: async (companyId = '11111111-1111-1111-1111-111111111101') => {
      try {
        const response = await apiClient.get(`/companies/${companyId}`);
        const dbData = unwrap(response);
        
        return {
          company: {
            id: dbData.id,
            razaoSocial: dbData.razaoSocial || 'Não informada',
            nomeFantasia: dbData.nomeFantasia || 'Sem Nome',
            cnpj: dbData.cnpj || 'Não informado',
            representanteNome: dbData.representanteNome || 'Não informado',
            emailContato: dbData.emailContato || 'Não informado',
            telefoneContato: dbData.telefone || 'Não informado',
            porte: dbData.tipo || 'Não informado',
            categoria: 'Afiliada',
            status: dbData.status || 'Desconhecido',
            dataAdesao: dbData.dataVigenciaInicio ? new Date(dbData.dataVigenciaInicio).toLocaleDateString('pt-BR') : 'Não informada',
            endereco: dbData.enderecoCompleto || 'Sede Pollen'
          },
          contract: {
            status: dbData.status,
            numeroTermo: dbData.contratos?.[0]?.numeroTermo || 'N/A',
            dataInicio: dbData.dataVigenciaInicio ? new Date(dbData.dataVigenciaInicio).toLocaleDateString('pt-BR') : 'N/A',
            dataTermino: dbData.dataVigenciaFim ? new Date(dbData.dataVigenciaFim).toLocaleDateString('pt-BR') : 'N/A',
            proximaRenovacao: dbData.dataVigenciaFim ? new Date(dbData.dataVigenciaFim).toLocaleDateString('pt-BR') : 'N/A',
            diasRestantes: dbData.dataVigenciaFim ? Math.max(0, Math.ceil((new Date(dbData.dataVigenciaFim) - new Date()) / (1000 * 60 * 60 * 24))) : 0,
            valorAnuidadeAnual: dbData.contratos?.[0]?.valorAnuidade || 0,
            formaPagamento: 'Padrão',
            procuradoriaStatus: (dbData.assinaturas?.length >= 5) ? 'Assinado e Homologado' : 'Em andamento'
          },
          benefits: [
            { id: 'ben-lab', title: 'Laboratórios & Coworking', category: 'Infraestrutura', icon: '🔬', description: 'Acesso 24/7 às estações de trabalho e laboratórios com franquia de 40h/mês para a equipe técnica.', status: 'Ativo', badge: '40h / mês disponíveis' },
            { id: 'ben-rooms', title: 'Salas de Reunião & Videoconferência', category: 'Espaços', icon: '🏢', description: 'Reserva antecipada de salas equipadas com displays interativos e link de fibra ótica de 1 Gbps.', status: 'Ativo', badge: '10h mensais incluídas' },
            { id: 'ben-auditorio', title: 'Auditório e Espaço de Eventos', category: 'Eventos', icon: '🎤', description: '50% de desconto na locação do auditório principal para encontros técnicos, meetups e demonstrações.', status: 'Ativo', badge: '50% de desconto' },
            { id: 'ben-mentoria', title: 'Rede de Mentores e Matchmaking', category: 'Conexões', icon: '💡', description: 'Sessões mensais de mentoria executiva, apoio em editais FINEP/FAPESC e conexão com empresas âncoras.', status: 'Ativo', badge: 'Sessões mensais' }
          ],
          pendingDocuments: (dbData.documentos || []).map(d => ({
            id: d.id,
            tipo: d.tipo,
            situacao: d.statusConferencia,
            statusClass: d.statusConferencia === 'REJEITADO' ? 'pending' : (d.statusConferencia === 'APROVADO' ? 'active' : 'analysis'),
            dataExigencia: new Date(d.createdAt).toLocaleDateString('pt-BR'),
            validade: 'Conforme edital',
            obrigatorio: true,
            instrucao: d.justificativaRejeicao || 'Documento registrado no sistema.'
          })),
          payments: (dbData.faturas || []).map(p => ({
            id: p.id,
            competencia: p.dataVencimento ? p.dataVencimento.substring(0,7) : 'N/A',
            tipo: 'Fatura/Parcela',
            valor: p.valor,
            vencimento: p.dataVencimento ? new Date(p.dataVencimento).toLocaleDateString('pt-BR') : 'N/A',
            status: p.status === 'PENDENTE' ? 'Aguardando pagamento' : 'Pago',
            statusClass: p.status === 'PENDENTE' ? 'payment' : 'active',
            linhaDigitavel: p.numeroBoleto || p.pixCopiaCola,
            nfNumero: p.numeroNf,
            diasAteVencimento: p.dataVencimento ? Math.max(0, Math.ceil((new Date(p.dataVencimento) - new Date()) / (1000 * 60 * 60 * 24))) : 0
          }))
        };
      } catch (err) {
        console.error('Erro ao buscar dados do portal:', err);
        throw err;
      }
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
