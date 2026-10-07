// Use the same host that serves the frontend. This works on localhost,
// a LAN IP, or a DNS name without changing the source for each environment.
const frontendHost = window.location.hostname;
const apiHost = frontendHost;

const CONFIG = {
    API_BASE_URL: `http://${apiHost}:8000/api/v1`,
    UPLOADS_URL: '/uploads',
    TOKEN_KEY: 'job_portal_token',
    USER_KEY: 'job_portal_user'
};
