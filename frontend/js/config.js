// FastAPI is served by the live VM at 10.10.35.18. Local development keeps
// using the current browser host so localhost works without changes.
const frontendHost = window.location.hostname;
const apiHost = ['localhost', '127.0.0.1'].includes(frontendHost)
    ? frontendHost
    : '10.10.35.18';

const CONFIG = {
    API_BASE_URL: `http://${apiHost}:8000/api/v1`,
    UPLOADS_URL: '/uploads',
    TOKEN_KEY: 'job_portal_token',
    USER_KEY: 'job_portal_user'
};
