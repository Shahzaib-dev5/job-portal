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
            let errorMsg = 'Request failed';
            if (typeof data.detail === 'string') {
                errorMsg = data.detail;
            } else if (Array.isArray(data.detail) && data.detail.length > 0) {
                errorMsg = data.detail[0].msg || data.detail[0].message || JSON.stringify(data.detail);
            } else if (data.message) {
                errorMsg = data.message;
            } else if (data.detail) {
                errorMsg = JSON.stringify(data.detail);
            }
            throw new Error(errorMsg);
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

    static put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
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

    static async applyToJob(jobId, coverLetter) {
        try {
            const res = await this.post(`/students/jobs/${jobId}/apply`, { cover_letter: coverLetter });
            return res;
        } catch (error) {
            try {
                const apps = await this.get('/students/me/applications');
                const items = apps.items || apps.data || (Array.isArray(apps) ? apps : []);
                const exists = items.some(app => Number(app.job_id) === Number(jobId) && app.status !== 'withdrawn');
                if (exists) {
                    return { success: true, message: 'Application submitted successfully', fallback: true };
                }
            } catch (fallbackErr) {
                // Fallback check failed; rethrow original error
            }
            throw error;
        }
    }

    static async respondInterviewRequest(id, action) {
        try {
            const res = await this.post(`/students/me/interview-requests/${id}/${action}`);
            return res;
        } catch (error) {
            try {
                const requests = await this.get('/students/me/interview-requests');
                const items = requests.items || requests.data || (Array.isArray(requests) ? requests : []);
                const match = items.find(r => Number(r.id) === Number(id));
                const targetStatus = action === 'accept' ? 'accepted' : 'declined';
                if (match && match.status === targetStatus) {
                    return { success: true, message: `Interview request ${action}ed successfully`, fallback: true };
                }
            } catch (fallbackErr) {
                // Fallback check failed; rethrow original error
            }
            throw error;
        }
    }
}
