let currentPage = 1;
let currentTab = 'companies';
const pageSize = 10;

function renderAdminShell() {
    if (!Auth.isAuthenticated()) { window.location.href = '/login.html'; return false; }
    const user = Auth.getUser();
    if (!user || !['admin', 'super_admin'].includes(user.role)) { window.location.href = '/index.html'; return false; }
    const app = document.getElementById('app');
    app.appendChild(Navbar.render(user));
    document.getElementById('notification-bell').innerHTML = NotificationBell.render();
    updateUnreadCount();
    const main = document.createElement('main');
    main.className = 'dashboard-main';
    main.innerHTML = `<div class="dashboard-heading"><div><p class="dashboard-kicker">Operations</p><h1>Admin Dashboard</h1><p class="dashboard-subtitle">Monitor companies, opportunities, students, and applications.</p></div><a class="dashboard-home-link" href="/index.html">View portal</a></div><div id="stats" class="dashboard-stats"></div><nav class="dashboard-tabs" aria-label="Dashboard sections"><button data-tab="companies" onclick="switchTab('companies')" class="tab-btn active">Companies</button><button data-tab="jobs" onclick="switchTab('jobs')" class="tab-btn">Jobs</button><button data-tab="students" onclick="switchTab('students')" class="tab-btn">Students</button><button data-tab="applications" onclick="switchTab('applications')" class="tab-btn">Applications</button></nav><div id="tab-content"></div>`;
    app.appendChild(main);
    return true;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!renderAdminShell()) return;
    await loadStats();
    await switchTab('companies');
});

async function loadStats() {
    try {
        const [companies, jobs, students] = await Promise.all([API.get('/admin/companies?page=1&page_size=1'), API.get('/admin/jobs?page=1&page_size=1'), API.get('/admin/students?page=1&page_size=1')]);
        document.getElementById('stats').innerHTML = [['Companies', companies.total], ['Jobs', jobs.total], ['Students', students.total]].map(([label, value], index) => `<div class="stat-card"><span class="stat-index">0${index + 1}</span><p>Total ${label}</p><strong>${value || 0}</strong></div>`).join('');
    } catch (error) { console.warn('Stats unavailable:', error.message); }
}

window.switchTab = async function(tab) {
    currentTab = tab;
    currentPage = 1;
    document.querySelectorAll('.tab-btn').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
    const loaders = { companies: loadCompanies, jobs: loadJobs, students: loadStudents, applications: loadApplications };
    await loaders[tab]();
};

function tableCard(title, subtitle, headers, rows, total, action = '') {
    return `<section class="admin-table-card"><header class="admin-table-header admin-table-header-actions"><div><h2>${title}</h2><p>${subtitle}</p></div>${action}</header><div class="overflow-x-auto"><table class="admin-table"><thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}" class="empty-row">No records found.</td></tr>`}</tbody></table></div>${renderPagination(total, currentPage, pageSize, total > currentPage * pageSize, currentTab)}</section>`;
}

async function loadCompanies() {
    try {
        const data = await API.get(`/admin/companies?page=${currentPage}&page_size=${pageSize}`);
        const rows = data.items.map(company => `
            <tr>
                <td><strong>${company.company_name}</strong><small>${company.industry || 'Industry not set'}</small></td>
                <td>${company.email}</td>
                <td><span class="status-badge status-${company.status}">${company.status}</span></td>
                <td class="table-actions"><button onclick="showCompanyDetails(${company.id})" class="dashboard-button dashboard-button-secondary">View details</button></td>
            </tr>
        `).join('');
        document.getElementById('tab-content').innerHTML = tableCard('Companies', 'Review and manage employer accounts.', ['Company', 'Email', 'Status', 'Actions'], rows, data.total);
    } catch (error) { showToast(error.message, 'error'); }
}

// Show company details in a modal and allow approve/reject (and reversing) from there
async function showCompanyDetails(companyId) {
    try {
        const c = await API.get(`/admin/companies/${companyId}`);
        const overlay = document.createElement('div'); overlay.id = 'modal-overlay'; overlay.className = 'modal-backdrop';

        // Actions vary depending on current status
        let actionsHtml = '';
        if (c.status === 'pending') {
            actionsHtml = `
                <div class="profile-actions">
                    <button onclick="approveCompanyFromModal(${companyId})" class="dashboard-button dashboard-button-primary">Approve</button>
                    <button onclick="rejectCompanyFromModal(${companyId})" class="dashboard-button dashboard-button-secondary">Reject</button>
                    <button onclick="deleteCompanyFromModal(${companyId})" class="dashboard-button" style="background:#b42318;color:#fff;">Delete</button>
                    <small>Use these actions to approve, reject, or delete this company.</small>
                </div>
            `;
        } else if (c.status === 'rejected') {
            // Allow reversing a rejection by approving again and allow deletion
            actionsHtml = `
                <div class="profile-actions">
                    <button onclick="approveCompanyFromModal(${companyId})" class="dashboard-button dashboard-button-primary">Approve</button>
                    <button onclick="deleteCompanyFromModal(${companyId})" class="dashboard-button" style="background:#b42318;color:#fff;">Delete</button>
                    <small>This company was rejected previously. Use "Approve" to restore the account or "Delete" to remove it.</small>
                </div>
            `;
        } else if (c.status === 'approved') {
            // Allow admin to reject or disable an already approved company and delete
            actionsHtml = `
                <div class="profile-actions">
                    <button onclick="rejectCompanyFromModal(${companyId})" class="dashboard-button dashboard-button-secondary">Reject</button>
                    <button onclick="companyAction(${companyId}, 'disable')" class="dashboard-button dashboard-button-secondary">Disable</button>
                    <button onclick="deleteCompanyFromModal(${companyId})" class="dashboard-button" style="background:#b42318;color:#fff;">Delete</button>
                    <small>Manage this approved company.</small>
                </div>
            `;
        } else if (c.status === 'disabled') {
            // Allow enabling a disabled company back to approved and allow deletion
            actionsHtml = `
                <div class="profile-actions">
                    <button onclick="enableCompanyFromModal(${companyId})" class="dashboard-button dashboard-button-primary">Enable</button>
                    <button onclick="deleteCompanyFromModal(${companyId})" class="dashboard-button" style="background:#b42318;color:#fff;">Delete</button>
                    <small>This company is disabled. Use "Enable" to restore the account or "Delete" to remove it.</small>
                </div>
            `;
        } else {
            actionsHtml = `<div class="profile-actions"><small>No administrative actions available for this company.</small></div>`;
        }

        overlay.innerHTML = `
            <div class="company-modal" style="width:min(900px,100%); background:#fff; border-top:4px solid var(--orange); padding:22px; border-radius:6px;">
                <button class="modal-close" onclick="closeModal()">×</button>
                <div class="profile-card-header">
                    <div class="company-avatar">${c.company_name ? c.company_name.charAt(0) : 'C'}</div>
                    <div class="profile-title">
                        <h2>${c.company_name}</h2>
                        <p>${c.website || ''} <span>${c.location || ''}</span></p>
                    </div>
                    <div style="text-align:right; min-width:160px;">
                        <div><strong>${c.email}</strong></div>
                        <div class="status-badge status-${c.status}" style="margin-top:8px;">${c.status}</div>
                    </div>
                </div>
                <div class="profile-details">
                    <div><span>Industry</span><strong>${c.industry || 'Not set'}</strong></div>
                    <div><span>Contact Email</span><strong>${c.contact_email || c.email || 'Not set'}</strong></div>
                    <div><span>Contact Phone</span><strong>${c.contact_phone || 'Not set'}</strong></div>
                </div>
                <div class="profile-description"><span>Description</span><p>${c.description || 'No description provided.'}</p></div>
                <div style="padding:18px 30px; border-top:1px solid #e3e9ef; display:flex; justify-content:space-between; align-items:center; gap:16px;">
                    <div style="color:#61738a; font-size:13px;">Created at: ${c.created_at || 'N/A'}</div>
                    ${actionsHtml}
                </div>
            </div>
        `;

        // Close modal when clicking outside the modal content
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

        document.body.appendChild(overlay);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function approveCompanyFromModal(companyId) {
    try {
        await API.post(`/admin/companies/${companyId}/approve`);
        closeModal();
        showToast('Company approved');
        await loadCompanies();
    } catch (error) { showToast(error.message, 'error'); }
}

async function rejectCompanyFromModal(companyId) {
    const reason = prompt('Enter rejection reason (optional):');
    try {
        const endpoint = reason ? `/admin/companies/${companyId}/reject?reason=${encodeURIComponent(reason)}` : `/admin/companies/${companyId}/reject`;
        await API.post(endpoint, null);
        closeModal();
        showToast('Company rejected');
        await loadCompanies();
    } catch (error) { showToast(error.message, 'error'); }
}

async function enableCompanyFromModal(companyId) {
    try {
        await API.patch(`/admin/companies/${companyId}/status`, { status: 'approved' });
        closeModal();
        showToast('Company enabled');
        await loadCompanies();
    } catch (error) { showToast(error.message, 'error'); }
}

async function deleteCompanyFromModal(companyId) {
    const ok = confirm('Are you sure you want to delete this company? This will set the company status to "deleted" and cannot be undone easily.');
    if (!ok) return;
    try {
        await API.patch(`/admin/companies/${companyId}/status`, { status: 'deleted' });
        closeModal();
        showToast('Company deleted');
        await loadCompanies();
    } catch (error) { showToast(error.message, 'error'); }
}

async function companyAction(id, action) { try { await API.post(`/admin/companies/${id}/${action}`); showToast(`Company ${action}d`); await loadCompanies(); } catch (error) { showToast(error.message, 'error'); } }

async function loadJobs() {
    try { const data = await API.get(`/admin/jobs?page=${currentPage}&page_size=${pageSize}`); const rows = data.items.map(job => `<tr><td class="px-5 py-4 font-medium">${job.title}</td><td class="px-5 py-4">${job.company_name || job.company_id}</td><td class="px-5 py-4"><span class="rounded-full bg-slate-100 px-2 py-1 text-xs">${job.status}</span></td><td class="px-5 py-4"><select onchange="updateJobStatus(${job.id}, this.value)" class="rounded-md border border-slate-300 px-2 py-1 text-sm"><option value="draft" ${job.status === 'draft' ? 'selected' : ''}>Draft</option><option value="published" ${job.status === 'published' ? 'selected' : ''}>Published</option><option value="closed" ${job.status === 'closed' ? 'selected' : ''}>Closed</option><option value="hidden" ${job.status === 'hidden' ? 'selected' : ''}>Hidden</option></select></td></tr>`).join(''); document.getElementById('tab-content').innerHTML = tableCard('Jobs', 'Monitor and update job listings.', ['Title', 'Company', 'Status', 'Update'], rows, data.total, '<button onclick="showCreateJobModal()" class="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Post job</button>'); } catch (error) { showToast(error.message, 'error'); }
}

async function updateJobStatus(id, status) { try { await API.patch(`/admin/jobs/${id}/status`, { status }); showToast('Job status updated'); await loadJobs(); } catch (error) { showToast(error.message, 'error'); } }

async function loadStudents() {
    try { const data = await API.get(`/admin/students?page=${currentPage}&page_size=${pageSize}`); const rows = data.items.map(student => `<tr><td class="px-5 py-4 font-medium">${student.name}</td><td class="px-5 py-4">${student.roll_no}</td><td class="px-5 py-4">${student.department}</td><td class="px-5 py-4">${student.semester}</td><td class="px-5 py-4">${student.email}</td></tr>`).join(''); document.getElementById('tab-content').innerHTML = tableCard('Students', 'Browse student profiles and academic details.', ['Name', 'Roll no.', 'Department', 'Semester', 'Email'], rows, data.total); } catch (error) { showToast(error.message, 'error'); }
}

async function loadApplications() {
    try { const data = await API.get(`/admin/applications?page=${currentPage}&page_size=${pageSize}`); const rows = data.items.map(application => `<tr><td class="px-5 py-4">${application.job_title || 'N/A'}</td><td class="px-5 py-4">${application.student_name || application.student_roll_no || 'N/A'}</td><td class="px-5 py-4"><span class="rounded-full bg-slate-100 px-2 py-1 text-xs">${application.status}</span></td><td class="px-5 py-4 text-slate-500">${formatDate(application.applied_at)}</td></tr>`).join(''); document.getElementById('tab-content').innerHTML = tableCard('Applications', 'Track candidate applications across the portal.', ['Job', 'Student', 'Status', 'Applied'], rows, data.total); } catch (error) { showToast(error.message, 'error'); }
}

window.changePage = function(page, tab) { if (page < 1) return; currentPage = page; window.switchTab(tab); };

function showCreateJobModal() {
    const overlay = document.createElement('div'); overlay.id = 'modal-overlay'; overlay.className = 'modal-backdrop';
    overlay.innerHTML = `<form onsubmit="createJob(event)" class="job-modal"><h2>Post a job</h2><div class="job-form-grid"><input id="job-title" required placeholder="Job title"><textarea id="job-description" required placeholder="Description"></textarea><input id="job-location" placeholder="Location"><select id="job-type"><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="internship">Internship</option><option value="contract">Contract</option><option value="remote">Remote</option></select><input id="job-deadline" type="date"><select id="job-status"><option value="draft">Draft</option><option value="published">Published</option></select></div><div class="job-modal-actions"><button type="button" onclick="closeModal()" class="dashboard-button dashboard-button-secondary">Cancel</button><button class="dashboard-button dashboard-button-primary">Create job</button></div></form>`; document.body.appendChild(overlay);
}

async function createJob(event) { event.preventDefault(); const data = { title: document.getElementById('job-title').value, description: document.getElementById('job-description').value, location: document.getElementById('job-location').value || null, employment_type: document.getElementById('job-type').value, application_deadline: document.getElementById('job-deadline').value || null, status: document.getElementById('job-status').value }; try { await API.post('/admin/jobs', data); closeModal(); showToast('Job created'); await loadJobs(); } catch (error) { showToast(error.message, 'error'); } }
