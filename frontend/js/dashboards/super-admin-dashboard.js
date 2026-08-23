let currentPage = 1;
let currentTab = 'admins';
const pageSize = 10;

function setupDashboard(requiredRole) {
    if (!Auth.isAuthenticated()) {
        window.location.href = '../../login.html';
        return null;
    }
    const user = Auth.getUser();
    if (!user || user.role !== requiredRole) {
        window.location.href = '../../index.html';
        return null;
    }
    const app = document.getElementById('app');
    app.appendChild(Navbar.render(user));
    document.getElementById('notification-bell').innerHTML = NotificationBell.render();
    updateUnreadCount();
    return app;
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = setupDashboard('super_admin');
    if (!app) return;
    const main = document.createElement('main');
    main.className = 'dashboard-main';
    main.innerHTML = `
        <div class="dashboard-heading"><div><p class="dashboard-kicker">Control center</p><h1>Super Admin Dashboard</h1><p class="dashboard-subtitle">Manage platform access and review employer registrations.</p></div><a class="dashboard-home-link" href="/index.html">View portal</a></div>
        <div class="dashboard-tabs"><nav class="dashboard-tabs-inner" aria-label="Dashboard sections">
            <button onclick="switchTab('admins')" data-tab="admins" class="tab-btn active">Admins</button>
            <button onclick="switchTab('companies')" data-tab="companies" class="tab-btn">Companies</button>
        </nav></div>
        <div id="tab-content"></div>`;
    app.appendChild(main);
    await switchTab('admins');
});

window.switchTab = async function(tab) {
    currentTab = tab;
    currentPage = 1;
    document.querySelectorAll('.tab-btn').forEach(button => {
        const active = button.dataset.tab === tab;
        button.classList.toggle('active', active);
    });
    if (tab === 'admins') await loadAdmins();
    if (tab === 'companies') await loadCompanies();
};

async function loadAdmins() {
    const container = document.getElementById('tab-content');
    try {
        const response = await API.get(`/super-admin/admins?page=${currentPage}&page_size=${pageSize}`);
        const hasMore = response.total > currentPage * pageSize;
        container.innerHTML = `<section class="admin-table-card"><header class="admin-table-header admin-table-header-actions"><div><h2>Admin accounts</h2><p>Manage access for platform administrators.</p></div><button onclick="showCreateAdminModal()" class="dashboard-button dashboard-button-primary">New admin</button></header>${renderAdminTable(response.items)}${renderPagination(response.total, currentPage, pageSize, hasMore, 'admins')}</section>`;
    } catch (error) { showToast(`Failed to load admins: ${error.message}`, 'error'); }
}

function renderAdminTable(items) {
    return `<div class="overflow-x-auto"><table class="admin-table"><thead><tr><th>Email</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>${items.length ? items.map(admin => `<tr><td><strong>${admin.email}</strong><small>${admin.name || 'Platform administrator'}</small></td><td><span class="status-badge status-${admin.status}">${admin.status}</span></td><td>${formatDate(admin.created_at)}</td><td class="table-actions"><button class="action-approve" onclick="toggleAdminStatus(${admin.id}, '${admin.status}')">${admin.status === 'active' ? 'Disable' : 'Enable'}</button><button class="action-reject" onclick="deleteAdmin(${admin.id})">Delete</button></td></tr>`).join('') : '<tr><td colspan="4" class="empty-row">No admins found.</td></tr>'}</tbody></table></div>`;
}

async function loadCompanies() {
    const container = document.getElementById('tab-content');
    try {
        const response = await API.get(`/super-admin/companies?page=${currentPage}&page_size=${pageSize}`);
        const hasMore = response.total > currentPage * pageSize;
        container.innerHTML = `<section class="admin-table-card"><header class="admin-table-header"><div><h2>Companies</h2><p>Review employer accounts, documents, and approval status.</p></div></header><div class="overflow-x-auto"><table class="admin-table"><thead><tr><th>Company</th><th>Email</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>${response.items.length ? response.items.map(company => `<tr><td><strong>${company.company_name}</strong><small>${company.industry || 'Industry not set'}${company.location ? ` • ${company.location}` : ''}</small></td><td>${company.email}</td><td><span class="status-badge status-${company.status}">${company.status}</span></td><td>${formatDate(company.created_at)}</td><td class="table-actions">${company.status === 'pending' ? `<button class="action-approve" onclick="companyAction(${company.id}, 'approve')">Approve</button><button class="action-reject" onclick="companyAction(${company.id}, 'reject')">Reject</button>` : company.status === 'approved' ? `<button class="action-disable" onclick="companyAction(${company.id}, 'disable')">Disable</button>` : company.status === 'disabled' ? `<button class="action-approve" onclick="companyAction(${company.id}, 'approve')">Approve</button>` : '<span class="muted-action">No actions</span>'}</td></tr>`).join('') : '<tr><td colspan="5" class="empty-row">No companies found.</td></tr>'}</tbody></table></div>${renderPagination(response.total, currentPage, pageSize, hasMore, 'companies')}</section>`;
    } catch (error) { showToast(`Failed to load companies: ${error.message}`, 'error'); }
}

window.changePage = function(page, tab) { if (page < 1) return; currentPage = page; if (tab === 'admins') loadAdmins(); else loadCompanies(); };

async function companyAction(companyId, action) {
    try {
        const endpoint = action === 'approve' ? `/admin/companies/${companyId}/approve` : action === 'reject' ? `/admin/companies/${companyId}/reject` : `/admin/companies/${companyId}/disable`;
        await API.post(endpoint);
        showToast(`Company ${action}d successfully`);
        await loadCompanies();
    } catch (error) { showToast(error.message, 'error'); }
}

function showCreateAdminModal() {
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4';
    overlay.innerHTML = `<form onsubmit="createAdmin(event)" class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"><div class="mb-5"><h2 class="text-xl font-semibold">Create admin</h2><p class="text-sm text-slate-500">Add an administrator account.</p></div><div class="space-y-4"><input id="admin-email" required type="email" placeholder="Email" class="w-full rounded-md border border-slate-300 px-3 py-2"><input id="admin-password" required type="password" placeholder="Password" class="w-full rounded-md border border-slate-300 px-3 py-2"><input id="admin-name" type="text" placeholder="Name (optional)" class="w-full rounded-md border border-slate-300 px-3 py-2"></div><div class="mt-6 flex justify-end gap-3"><button type="button" onclick="closeModal()" class="rounded-md border px-4 py-2">Cancel</button><button class="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white">Create</button></div></form>`;
    document.body.appendChild(overlay);
}

async function createAdmin(event) {
    event.preventDefault();
    try { await API.post('/super-admin/admins', { email: document.getElementById('admin-email').value, password: document.getElementById('admin-password').value, name: document.getElementById('admin-name').value || null }); closeModal(); showToast('Admin created'); await loadAdmins(); } catch (error) { showToast(error.message, 'error'); }
}

async function toggleAdminStatus(adminId, currentStatus) {
    try { await API.patch(`/super-admin/admins/${adminId}/status`, { status: currentStatus === 'active' ? 'disabled' : 'active' }); showToast('Admin status updated'); await loadAdmins(); } catch (error) { showToast(error.message, 'error'); }
}

async function deleteAdmin(adminId) {
    if (!confirm('Delete this admin account?')) return;
    try { await API.delete(`/super-admin/admins/${adminId}`); showToast('Admin deleted'); await loadAdmins(); } catch (error) { showToast(error.message, 'error'); }
}
