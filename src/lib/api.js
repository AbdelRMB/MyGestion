const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Normalize server feature objects (snake_case) to frontend-friendly camelCase
const normalizeFeature = (f) => {
  if (!f || typeof f !== 'object') return f;
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    isCompleted: f.is_completed === 1 || f.is_completed === true || f.isCompleted === true,
    orderIndex: Number.isFinite(Number(f.order_index)) ? Number(f.order_index) : (f.orderIndex || 0),
    level: Number.isFinite(Number(f.level)) ? Number(f.level) : (f.level || 1),
    parentId: f.parent_id ?? f.parentId ?? null,
    specificationId: f.specification_id ?? f.specificationId ?? null,
    createdAt: f.created_at ?? f.createdAt ?? null,
    updatedAt: f.updated_at ?? f.updatedAt ?? null,
    // include any other fields unchanged
    ...Object.fromEntries(Object.entries(f).filter(([k]) => ![
      'id','title','description','is_completed','isCompleted','order_index','orderIndex','level','parent_id','parentId','specification_id','specificationId','created_at','createdAt','updated_at','updatedAt'
    ].includes(k)))
  };
};

export const authAPI = {
  signup: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de l\'inscription');
    return data;
  },

  signin: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la connexion');
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  signout: () => {
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    return await response.json();
  },
};

export const specificationsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/specifications`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des cahiers');
    return await response.json();
  },

  create: async (title, description) => {
    const response = await fetch(`${API_URL}/specifications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la création');
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/specifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
  },
};

export const featuresAPI = {
  getBySpecification: async (specificationId) => {
    const response = await fetch(`${API_URL}/specifications/${specificationId}/features`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = data && data.message ? data.message : 'Erreur lors du chargement des fonctionnalités';
      throw new Error(msg);
    }
    // Normalize array of features
    return Array.isArray(data) ? data.map(normalizeFeature) : data;
  },

  create: async (specificationId, title, description, orderIndex, level = 1, parentId = null) => {
    const body = { title, description };
    // ensure orderIndex is an integer (fallback to 0)
    const idx = Number(orderIndex);
    body.orderIndex = Number.isFinite(idx) && !Number.isNaN(idx) ? Math.floor(idx) : 0;
    if (level !== undefined) body.level = Number(level);
    // only include parentId if it's a valid integer
    if (parentId !== undefined && parentId !== null && Number.isInteger(Number(parentId))) {
      body.parentId = Number(parentId);
    }

    const response = await fetch(`${API_URL}/specifications/${specificationId}/features`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      // Construire un message d'erreur riche si le backend renvoie des détails
      let msg = data && data.message ? data.message : 'Erreur lors de la création';
      if (data && data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const extra = data.errors.map(e => e.msg || e.message || JSON.stringify(e)).join('; ');
        msg = `${msg}: ${extra}`;
      }
      throw new Error(msg);
    }
    return normalizeFeature(data);
  },

  update: async (id, updates) => {
    const response = await fetch(`${API_URL}/features/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = data && data.message ? data.message : 'Erreur lors de la mise à jour';
      throw new Error(msg);
    }
    return normalizeFeature(data);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/features/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
  },
};

export const quotesAPI = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.status && params.status !== 'all') searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);

    const url = `${API_URL}/quotes${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors du chargement des devis');
    
    return data.quotes || data; // Gère les deux formats de réponse
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/quotes/${id}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors du chargement du devis');
    
    return data;
  },

  create: async (quoteData) => {
    const response = await fetch(`${API_URL}/quotes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(quoteData),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la création du devis');
    
    return data;
  },

  update: async (id, quoteData) => {
    const response = await fetch(`${API_URL}/quotes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(quoteData),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la mise à jour du devis');
    
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/quotes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erreur lors de la suppression du devis');
    }
  },

  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/quotes/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la mise à jour du statut');
    
    return data;
  },

  duplicate: async (id) => {
    const response = await fetch(`${API_URL}/quotes/${id}/duplicate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la duplication du devis');
    
    return data;
  },

  sendByEmail: async (id) => {
    // Pour le moment, on simule l'envoi par email
    // Dans une vraie application, ceci ferait appel à un service d'email
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Devis envoyé par email' });
      }, 1000);
    });
  }
};

export const invoicesAPI = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.status && params.status !== 'all') searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);

    const url = `${API_URL}/invoices${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors du chargement des factures');
    
    return data;
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors du chargement de la facture');
    
    return data;
  },

  create: async (invoiceData) => {
    const response = await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(invoiceData),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la création de la facture');
    
    return data;
  },

  createFromQuote: async (quoteId) => {
    const response = await fetch(`${API_URL}/invoices/from-quote/${quoteId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la création de la facture à partir du devis');
    
    return data;
  },

  update: async (id, invoiceData) => {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(invoiceData),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la mise à jour de la facture');
    
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erreur lors de la suppression de la facture');
    }
  },

  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/invoices/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la mise à jour du statut');
    
    return data;
  },

  recordPayment: async (id, paymentData) => {
    const response = await fetch(`${API_URL}/invoices/${id}/payment`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de l\'enregistrement du paiement');
    
    return data;
  },

  duplicate: async (id) => {
    const response = await fetch(`${API_URL}/invoices/${id}/duplicate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la duplication de la facture');
    
    return data;
  },

  sendByEmail: async (id) => {
    // Pour le moment, on simule l'envoi par email
    // Dans une vraie application, ceci ferait appel à un service d'email
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Facture envoyée par email' });
      }, 1000);
    });
  }
};

export const contractsAPI = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.status && params.status !== 'all') searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);

    const url = `${API_URL}/contracts${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors du chargement des contrats');
    
    return data;
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/contracts/${id}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors du chargement du contrat');
    
    return data;
  },

  create: async (contractData) => {
    const response = await fetch(`${API_URL}/contracts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(contractData),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la création du contrat');
    
    return data;
  },

  createFromQuote: async (quoteId) => {
    const response = await fetch(`${API_URL}/contracts/from-quote/${quoteId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la création du contrat à partir du devis');
    
    return data;
  },

  update: async (id, contractData) => {
    const response = await fetch(`${API_URL}/contracts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(contractData),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la mise à jour du contrat');
    
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/contracts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erreur lors de la suppression du contrat');
    }
  },

  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/contracts/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la mise à jour du statut');
    
    return data;
  },

  updateMilestone: async (contractId, milestoneId, milestoneData) => {
    const response = await fetch(`${API_URL}/contracts/${contractId}/milestones/${milestoneId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(milestoneData),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la mise à jour du jalon');
    
    return data;
  },

  duplicate: async (id) => {
    const response = await fetch(`${API_URL}/contracts/${id}/duplicate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la duplication du contrat');
    
    return data;
  },

  sendByEmail: async (id) => {
    // Pour le moment, on simule l'envoi par email
    // Dans une vraie application, ceci ferait appel à un service d'email
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Contrat envoyé par email' });
      }, 1000);
    });
  }
};
