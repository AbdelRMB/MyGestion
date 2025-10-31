const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
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
    if (!response.ok) throw new Error('Erreur lors du chargement des fonctionnalités');
    return await response.json();
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
      let msg = data.message || 'Erreur lors de la création';
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const extra = data.errors.map(e => e.msg || e.message || JSON.stringify(e)).join('; ');
        msg = `${msg}: ${extra}`;
      }
      throw new Error(msg);
    }
    return data;
  },

  update: async (id, updates) => {
    const response = await fetch(`${API_URL}/features/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erreur lors de la mise à jour');
    return data;
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/features/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
  },
};
