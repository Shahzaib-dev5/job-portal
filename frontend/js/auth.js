class Auth {
    static isAuthenticated() {
        return !!localStorage.getItem(CONFIG.TOKEN_KEY);
    }

    static getUser() {
        const user = localStorage.getItem(CONFIG.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    static getDisplayName(user = this.getUser()) {
        return user?.name || user?.email || 'Account';
    }

    static setAuth(token, user) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    }

    static redirectToDashboard() {
        const user = this.getUser();
        const dashboards = {
            super_admin: '/js/dashboards/super-admin-dashboard.html',
            admin: '/js/dashboards/admin-dashboard.html',
            company: '/js/dashboards/company-dashboard.html',
            student: '/js/dashboards/student-dashboard.html'
        };
        const target = dashboards[user?.role];
        if (target) {
            window.location.href = target;
        } else {
            this.logout();
        }
    }

    static logout() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
        window.location.href = '/index.html';
    }
}

function toggleAccountMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('account-menu');
    const button = document.getElementById('account-menu-button');
    if (!menu || !button) return;
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    button.setAttribute('aria-expanded', String(!isOpen));
}

document.addEventListener('click', (event) => {
    const wrapper = document.getElementById('account-menu-wrapper');
    if (!wrapper || wrapper.contains(event.target)) return;
    const menu = document.getElementById('account-menu');
    const button = document.getElementById('account-menu-button');
    if (menu) menu.classList.add('hidden');
    if (button) button.setAttribute('aria-expanded', 'false');
});
