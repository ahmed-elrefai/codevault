const API_BASE_URL = 'http://localhost:8000'; // Adjust as needed

export const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'API request failed');
        }

        return response.json();
    },

    auth: {
        login: (email, password) =>
            api.request('/auth/token', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),

        signup: (name, email, password) =>
            api.request('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
            }),

        me: () => api.request('/auth/me'),
    },

    documents: {
        list: (skip = 0, limit = 100) =>
            api.request(`/api/v1/documents?offset=${skip}&limit=${limit}`),

        create: (data) =>
            api.request('/api/v1/documents', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        get: (id) => api.request(`/api/v1/documents/${id}`),

        update: (id, data) =>
            api.request(`/api/v1/documents/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id) =>
            api.request(`/api/v1/documents/${id}`, {
                method: 'DELETE',
            }),
    }
};
