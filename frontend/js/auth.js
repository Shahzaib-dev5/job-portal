class Auth {
    static isAuthenticated() {
        return !!localStorage.getItem(CONFIG.TOKEN_KEY);
    }

    static getUser() {
        const user = localStorage.getItem(CONFIG.USER_KEY);
        return user ? JSON.parse(user) : null;
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