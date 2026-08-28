class API {
    static async request(endpoint, options = {}) {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }

        let response;
        try {
            response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });
        } catch (error) {
            throw new Error('Backend server is not reachable. Start FastAPI on http://localhost:8000 and try again.');
        }

        if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/student/login') && !endpoint.includes('/auth/lms-login')) {
            localStorage.removeItem(CONFIG.TOKEN_KEY);
            localStorage.removeItem(CONFIG.USER_KEY);
            window.location.href = '/login.html';
            throw new Error('Unauthorized');
        }

        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : { detail: await response.text() };

        if (!response.ok) {
            throw new Error(data.detail || 'Request failed');
        }

        return data;
    }

    static get(endpoint) {
        return this.request(endpoint);
    }

    static post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    static patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }

    static delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    static async upload(endpoint, formData, method = 'POST') {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const headers = token ? { Authorization: 'Bearer ' + token } : {};;
        const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: formData
        });

        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : { detail: await response.text() };
        if (!response.ok) throw new Error(data.detail || 'Upload failed');
        return data;
    }
}
