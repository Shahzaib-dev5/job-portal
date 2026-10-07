let currentPage = 1;
let currentTab = 'companies';
const pageSize = 10;
let lastUnreadNotificationCount = null;

async function refreshAdminNotifications() {
    const unreadCount = await updateUnreadCount();
    if (unreadCount === null || unreadCount === undefined) return;
    if (lastUnreadNotificationCount !== null && unreadCount > lastUnreadNotificationCount) {
        showToast('New company registration notification received.');
    }
    lastUnreadNotificationCount = unreadCount;
}

function renderAdminShell() {
    if (!Auth.isAuthenticated()) { window.location.href = '/login.html'; return false; }
    const user = Auth.getUser();
    if (!user || !['admin', 'super_admin'].includes(user.role)) { window.location.href = '/index.html'; return false; }
    const app = document.getElementById('app');
    app.appendChild(Navbar.render(user));
    document.getElementById('notification-bell').innerHTML = NotificationBell.render();
    refreshAdminNotifications();
    window.adminNotificationPolling = window.setInterval(refreshAdminNotifications, 10000);
    const main = document.createElement('main');
    main.className = 'dashboard-main';
    main.innerHTML = `<div class="dashboard-heading"><div><p class="dashboard-kicker">Operations</p><h1>Admin Dashboard</h1><p class="dashboard-subtitle">Monitor companies, opportunities, students, applications, and hiring outcomes.</p></div></div><div id="stats" class="dashboard-stats"></div><nav class="dashboard-tabs" aria-label="Dashboard sections"><button data-tab="companies" onclick="switchTab('companies')" class="tab-btn active">Companies</button><button data-tab="jobs" onclick="switchTab('jobs')" class="tab-btn">Jobs</button><button data-tab="students" onclick="switchTab('students')" class="tab-btn">Students</button><button data-tab="applications" onclick="switchTab('applications')" class="tab-btn">Applications</button><button data-tab="hired" onclick="switchTab('hired')" class="tab-btn">Hired Students</button></nav><div id="tab-content"></div>`;
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
        let stats;
        try {
            stats = await API.get('/admin/dashboard-stats');
        } catch (dashboardStatsError) {
            // Keep the dashboard usable while an older VM backend is being updated.
            const [companies, jobs, students, applications] = await Promise.all([
                API.get('/admin/companies?page=1&page_size=1'),
                API.get('/admin/jobs?page=1&page_size=1'),
                API.get('/admin/students?page=1&page_size=1'),
                API.get('/admin/application-stats')
            ]);
            stats = {
                employers: companies.total,
                students: students.total,
                interviewed: applications.interviewed,
                hired: applications.hired,
                roles: jobs.total,
                logins: 0
            };
        }
        const cards = [
            ['Employers', stats.employers, 'bi-building-check', 'Registered organisations'],
            ['Total Students', stats.students, 'bi-people', 'Student profiles'],
            ['Interviewed', stats.interviewed, 'bi-calendar2-check', 'Candidates in interviews'],
            ['Hired', stats.hired, 'bi-person-check', 'Successful placements'],
            ['Total Roles', stats.roles, 'bi-briefcase', 'Published and managed roles'],
            ['Logins', stats.logins, 'bi-shield-check', 'Accounts that have signed in']
        ];
        document.getElementById('stats').innerHTML = cards.map(([label, value, icon, caption], index) => `<article class="stat-card premium-metric metric-${index + 1}"><div class="premium-metric-icon"><i class="bi ${icon}"></i></div><div class="premium-metric-content"><p class="stat-label">${label}</p><strong class="stat-value">${value || 0}</strong><span class="stat-caption">${caption}</span></div><span class="premium-metric-arrow"><i class="bi bi-arrow-up-right"></i></span></article>`).join('');
    } catch (error) { console.warn('Stats unavailable:', error.message); }
}

window.switchTab = async function(tab) {
    currentTab = tab;
    currentPage = 1;
    document.querySelectorAll('.tab-btn').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
    const loaders = { companies: loadCompanies, jobs: loadJobs, students: loadStudents, applications: loadApplications, hired: loadHiredStudents };
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
                <td class="table-actions"><button onclick="showCompanyWorkspace(${company.id})" class="dashboard-button dashboard-button-secondary">Open company</button></td>
            </tr>
        `).join('');
        document.getElementById('tab-content').innerHTML = tableCard('Companies', 'Review and manage employer accounts.', ['Company', 'Email', 'Status', 'Actions'], rows, data.total);
    } catch (error) { showToast(error.message, 'error'); }
}

// Company workspace: the officer can manage one company without selecting a
// company again in every action.
function companyWorkspaceActions(company) {
    if (company.status === 'pending') return `<button class="dashboard-button dashboard-button-primary" onclick="updateCompanyFromWorkspace(${company.id}, 'approve')">Approve</button><button class="dashboard-button dashboard-button-secondary" onclick="updateCompanyFromWorkspace(${company.id}, 'reject')">Reject</button>`;
    if (company.status === 'approved') return `<button class="dashboard-button dashboard-button-secondary" onclick="updateCompanyFromWorkspace(${company.id}, 'disable')">Disable</button>`;
    if (company.status === 'disabled' || company.status === 'rejected') return `<button class="dashboard-button dashboard-button-primary" onclick="updateCompanyFromWorkspace(${company.id}, 'enable')">Enable</button>`;
    return '';
}

window.updateCompanyFromWorkspace = async function(companyId, action) {
    try {
        const endpoint = action === 'approve' ? `/admin/companies/${companyId}/approve` : action === 'reject' ? `/admin/companies/${companyId}/reject` : action === 'enable' ? `/admin/companies/${companyId}/status` : `/admin/companies/${companyId}/disable`;
        if (action === 'enable') await API.patch(endpoint, { status: 'approved' }); else await API.post(endpoint);
        showToast(`Company ${action === 'approve' || action === 'enable' ? 'approved/enabled' : action + 'd'} successfully`);
        closeModal();
        await showCompanyWorkspace(companyId);
        await loadCompanies();
    } catch (error) { showToast(error.message, 'error'); }
};

async function showCompanyWorkspace(companyId) {
    try {
        const company = await API.get(`/admin/companies/${companyId}`);
        let overview = { jobs: [], candidates: [], interviews: [] };
        try {
            overview = await API.get(`/admin/companies/${companyId}/overview`);
        } catch (overviewError) {
            console.warn('Company overview unavailable:', overviewError.message);
        }
        if (!overview.jobs?.length) {
            const jobsResponse = await API.get(`/admin/jobs?company_id=${companyId}&page=1&page_size=100`);
            const jobs = await Promise.all((jobsResponse.items || []).map(async job => {
                try {
                    const applications = await API.get(`/admin/applications?job_id=${job.id}&page=1&page_size=100`);
                    return { ...job, applications: applications.items || [] };
                } catch (applicationsError) {
                    console.warn('Job applications unavailable:', applicationsError.message);
                    return { ...job, applications: [] };
                }
            }));
            overview.jobs = jobs;
        }
        if (!overview.candidates?.length) {
            const candidates = new Map();
            overview.jobs.forEach(job => (job.applications || []).forEach(application => {
                const key = application.student_profile_id || application.student_roll_no || application.student_name;
                if (key && !candidates.has(String(key))) {
                    candidates.set(String(key), {
                        id: application.student_profile_id,
                        name: application.student_name,
                        roll_no: application.student_roll_no,
                        department: application.department,
                        email: application.student_email || application.email
                    });
                }
            }));
            overview.candidates = Array.from(candidates.values());
        }
        if (!overview.interviews?.length) {
            overview.interviews = overview.jobs.flatMap(job => (job.applications || [])
                .filter(application => application.interview_status || application.status === 'interviewed')
                .map(application => ({
                    id: application.id,
                    job_title: job.title,
                    student_name: application.student_name,
                    student_roll_no: application.student_roll_no,
                    status: application.interview_status || 'scheduled',
                    interview_date: application.interview_date
                })));
        }
        window.activeAdminCompany = { company, overview };
        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = 'modal-backdrop';
        overlay.innerHTML = `<div class="admin-company-workspace">
            <header class="admin-company-workspace-header"><div><p class="dashboard-kicker">Company workspace</p><h2>${escapeHtml(company.company_name)}</h2><p>${escapeHtml(company.email)} · <span class="status-badge status-${company.status}">${company.status}</span></p></div><div class="admin-company-workspace-actions">${companyWorkspaceActions(company)}<button class="dashboard-button dashboard-button-primary" onclick="showAdminJobModal(${company.id}, '${(company.company_name || '').replace(/'/g, "\\'")}')">Post job for this company</button><button class="modal-close" onclick="closeModal()">&times;</button></div></header>
            <nav class="admin-company-tabs"><button data-company-tab="general" onclick="switchCompanyWorkspaceTab('general')">General information</button><button data-company-tab="jobs" onclick="switchCompanyWorkspaceTab('jobs')">Posted jobs</button><button data-company-tab="applications" onclick="switchCompanyWorkspaceTab('applications')">Applications</button><button data-company-tab="candidates" onclick="switchCompanyWorkspaceTab('candidates')">Candidates</button><button data-company-tab="interviews" onclick="switchCompanyWorkspaceTab('interviews')">Interviews</button></nav>
            <div id="admin-company-workspace-content"></div>
        </div>`;
        overlay.addEventListener('click', event => { if (event.target === overlay) closeModal(); });
        document.body.appendChild(overlay);
        switchCompanyWorkspaceTab('general');
    } catch (error) { showToast(error.message, 'error'); }
}

window.switchCompanyWorkspaceTab = function(tab) {
    const state = window.activeAdminCompany;
    if (!state) return;
    document.querySelectorAll('[data-company-tab]').forEach(button => button.classList.toggle('active', button.dataset.companyTab === tab));
    const c = state.company;
    const o = state.overview;
    const jobs = o.jobs || [];
    const applications = jobs.flatMap(job => (job.applications || []).map(application => ({ ...application, job_title: job.title })));
    const content = document.getElementById('admin-company-workspace-content');
    if (tab === 'general') content.innerHTML = `<section class="company-workspace-card"><h3>General information</h3><div class="company-workspace-grid"><div><span>Company name</span><strong>${escapeHtml(c.company_name)}</strong></div><div><span>Account email</span><strong>${escapeHtml(c.email)}</strong></div><div><span>Contact email</span><strong>${escapeHtml(c.contact_email || 'Not provided')}</strong></div><div><span>Phone</span><strong>${escapeHtml(c.contact_phone || 'Not provided')}</strong></div><div><span>Industry</span><strong>${escapeHtml(c.industry || 'Not provided')}</strong></div><div><span>Location</span><strong>${escapeHtml(c.location || 'Not provided')}</strong></div><div><span>Website</span><strong>${escapeHtml(c.website || 'Not provided')}</strong></div><div><span>Status</span><strong>${escapeHtml(c.status)}</strong></div></div><div class="company-workspace-description"><span>Description</span><p>${escapeHtml(c.description || 'No description provided.')}</p></div></section>`;
    if (tab === 'jobs') content.innerHTML = `<section class="company-workspace-card"><div class="company-workspace-section-heading"><div><h3>Posted jobs</h3><p>${jobs.length} job(s) posted for ${escapeHtml(c.company_name)}.</p></div><button class="dashboard-button dashboard-button-primary" onclick="showAdminJobModal(${c.id}, '${(c.company_name || '').replace(/'/g, "\\'")}')">Post job</button></div>${jobs.length ? jobs.map(job => `<article class="company-workspace-job"><div><strong>${escapeHtml(job.title)}</strong><p>${escapeHtml(job.location || 'Remote')} · ${escapeHtml(job.employment_type)} · ${job.applications.length} application(s)</p></div><span class="status-badge status-${job.status}">${job.status}</span></article>`).join('') : '<p class="company-workspace-empty">No jobs posted yet.</p>'}</section>`;
    if (tab === 'applications') content.innerHTML = `<section class="company-workspace-card"><h3>Applications</h3>${applications.length ? `<div class="company-workspace-list">${applications.map(application => { const appStatus = application.status || 'applied'; return `<article><strong>${escapeHtml(application.job_title)}</strong><span>${escapeHtml(application.student_name || 'Student')} · ${escapeHtml(application.student_roll_no || '')}</span><span class="status-badge status-${escapeHtml(appStatus)}">${escapeHtml(appStatus)}</span></article>`; }).join('')}</div>` : '<p class="company-workspace-empty">No applications received.</p>'}</section>`;
    if (tab === 'candidates') content.innerHTML = `<section class="company-workspace-card"><h3>Candidate list</h3>${o.candidates?.length ? `<div class="company-workspace-list">${o.candidates.map(candidate => `<article><div><strong>${escapeHtml(candidate.name || 'Student')}</strong><span>${escapeHtml(candidate.roll_no || '')} · ${escapeHtml(candidate.department || 'Department not provided')}</span></div><span>${escapeHtml(candidate.email || '')}</span></article>`).join('')}</div>` : '<p class="company-workspace-empty">No candidates yet.</p>'}</section>`;
    if (tab === 'interviews') content.innerHTML = `<section class="company-workspace-card"><h3>Interviews</h3>${o.interviews?.length ? `<div class="company-workspace-list">${o.interviews.map(interview => `<article><div><strong>${escapeHtml(interview.job_title)}</strong><span>${escapeHtml(interview.student_name || 'Student')} · ${escapeHtml(interview.student_roll_no || '')}</span></div><span class="status-badge status-${interview.status}">${interview.status}</span></article>`).join('')}</div>` : '<p class="company-workspace-empty">No interviews yet.</p>'}</section>`;
};

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
                    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                        <button onclick="showAdminJobModal(${companyId}, '${(c.company_name || '').replace(/'/g, "\\'")}')" class="dashboard-button dashboard-button-primary">Post job on behalf</button>
                        ${actionsHtml}
                    </div>
                </div>
            </div>
        `;

        // Close modal when clicking outside the modal content
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

        document.body.appendChild(overlay);
        loadCompanyOverview(companyId, overlay.querySelector('.profile-description'));
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadCompanyOverview(companyId, anchor) {
    try {
        const overview = await API.get(`/admin/companies/${companyId}/overview`);
        const jobs = overview.jobs || [];
        const html = `<section style="padding:18px 30px; border-top:1px solid #e3e9ef;"><h3 style="margin-bottom:10px;">Jobs and applications</h3>${jobs.length ? jobs.map(job => `<article style="border:1px solid #e3e9ef; border-radius:6px; padding:12px; margin-top:10px;"><div style="display:flex; justify-content:space-between; gap:12px;"><strong>${escapeHtml(job.title)}</strong><span class="status-badge status-${job.status}">${job.status}</span></div><small>${job.applications.length} application(s) • ${escapeHtml(job.location || 'Remote')}</small>${job.applications.length ? `<div style="margin-top:8px;">${job.applications.map(app => `<div style="padding:6px 0; border-top:1px solid #eef2f6;"><strong>${escapeHtml(app.student_name || 'Student')}</strong> <small>${escapeHtml(app.student_roll_no || '')} • ${app.status}</small></div>`).join('')}</div>` : '<p style="margin-top:8px; color:#61738a;">No applications yet.</p>'}</article>`).join('') : '<p style="color:#61738a;">No jobs posted for this company.</p>'}</section>`;
        anchor.insertAdjacentHTML('afterend', html);
    } catch (error) { showToast(`Unable to load company jobs: ${error.message}`, 'error'); }
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
    try { const data = await API.get(`/admin/jobs?page=${currentPage}&page_size=${pageSize}`); const rows = data.items.map(job => `<tr><td class="px-5 py-4 font-medium">${job.title}</td><td class="px-5 py-4">${job.company_name || job.company_id}</td><td class="px-5 py-4"><span class="rounded-full bg-slate-100 px-2 py-1 text-xs">${job.status}</span></td><td class="px-5 py-4"><select data-no-search onchange="updateJobStatus(${job.id}, this.value)" class="rounded-md border border-slate-300 px-2 py-1 text-sm"><option value="draft" ${job.status === 'draft' ? 'selected' : ''}>Draft</option><option value="published" ${job.status === 'published' ? 'selected' : ''}>Published</option><option value="closed" ${job.status === 'closed' ? 'selected' : ''}>Closed</option><option value="hidden" ${job.status === 'hidden' ? 'selected' : ''}>Hidden</option></select></td></tr>`).join(''); document.getElementById('tab-content').innerHTML = tableCard('Jobs', 'Open a company workspace to post a job on its behalf.', ['Title', 'Company', 'Status', 'Update'], rows, data.total); } catch (error) { showToast(error.message, 'error'); }
}

async function updateJobStatus(id, status) { try { await API.patch(`/admin/jobs/${id}/status`, { status }); showToast('Job status updated'); await loadJobs(); } catch (error) { showToast(error.message, 'error'); } }

async function loadStudents() {
    try { const data = await API.get(`/admin/students?page=${currentPage}&page_size=${pageSize}`); const rows = data.items.map(student => `<tr><td><strong>${escapeHtml(student.name)}</strong><small>${escapeHtml(student.email)}</small></td><td>${escapeHtml(student.roll_no)}</td><td>${escapeHtml(student.department || 'Not set')}</td><td>${escapeHtml(student.semester || 'Not set')}</td><td class="table-actions"><button onclick="showStudentDetails(${student.id})" class="dashboard-button dashboard-button-secondary"><i class="bi bi-person-vcard"></i> View details</button></td></tr>`).join(''); document.getElementById('tab-content').innerHTML = tableCard('Students', 'Browse student profiles and academic details.', ['Student', 'Roll no.', 'Department', 'Semester', 'Actions'], rows, data.total); } catch (error) { showToast(error.message, 'error'); }
}

async function showStudentDetails(studentId) {
    try {
        const student = await API.get(`/admin/students/${studentId}`);
        const skills = (student.skills || []).map(item => `<span class="admin-detail-tag">${escapeHtml(item.skill_name)}${item.proficiency ? ` · ${escapeHtml(item.proficiency)}` : ''}</span>`).join('');
        const experiences = (student.experiences || []).map(item => `<article class="admin-detail-list-item"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.company_name)} · ${formatDate(item.start_date)} – ${item.end_date ? formatDate(item.end_date) : 'Present'}</span>${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}</article>`).join('');
        const certifications = (student.certifications || []).map(item => `<span class="admin-detail-tag"><i class="bi bi-award"></i> ${escapeHtml(item.name)}${item.issuer ? ` · ${escapeHtml(item.issuer)}` : ''}</span>`).join('');
        const photo = student.photo_path ? `<img src="${escapeHtml(getUploadUrl(student.photo_path))}" alt="${escapeHtml(student.name)}" class="admin-student-photo">` : `<div class="admin-student-photo admin-student-photo-fallback">${escapeHtml((student.name || 'S').charAt(0).toUpperCase())}</div>`;
        const resume = student.resume_path ? `<a href="${escapeHtml(getUploadUrl(student.resume_path))}" target="_blank" rel="noopener" class="dashboard-button dashboard-button-secondary"><i class="bi bi-file-earmark-pdf"></i> View resume</a>` : '';
        const overlay = document.createElement('div'); overlay.id = 'modal-overlay'; overlay.className = 'modal-backdrop admin-student-overlay';
        overlay.innerHTML = `<div class="admin-student-modal"><div class="admin-student-modal-header"><div>${photo}<div><p class="dashboard-kicker">Student profile</p><h2>${escapeHtml(student.name)}</h2><p>${escapeHtml(student.roll_no)} · ${escapeHtml(student.department || 'Department not set')}</p></div></div><button class="modal-close" onclick="closeModal()">&times;</button></div><div class="admin-student-modal-body"><div class="admin-student-facts"><div><span>Email</span><strong>${escapeHtml(student.email)}</strong></div><div><span>Semester</span><strong>${escapeHtml(student.semester || 'Not set')}</strong></div><div><span>Profile created</span><strong>${formatDate(student.created_at)}</strong></div></div><section class="admin-detail-section"><h3><i class="bi bi-person-lines-fill"></i> About the student</h3><p>${escapeHtml(student.bio || 'No biography provided.')}</p></section><section class="admin-detail-section"><h3><i class="bi bi-tools"></i> Skills</h3><div class="admin-detail-tags">${skills || '<span class="admin-detail-muted">No skills added.</span>'}</div></section><section class="admin-detail-section"><h3><i class="bi bi-briefcase"></i> Experience</h3>${experiences || '<span class="admin-detail-muted">No experience added.</span>'}</section><section class="admin-detail-section"><h3><i class="bi bi-patch-check"></i> Certifications</h3><div class="admin-detail-tags">${certifications || '<span class="admin-detail-muted">No certifications added.</span>'}</div></section><div class="admin-student-modal-footer">${resume}<button onclick="closeModal()" class="dashboard-button dashboard-button-primary">Close</button></div></div></div>`;
        overlay.addEventListener('click', event => { if (event.target === overlay) closeModal(); });
        document.body.appendChild(overlay);
    } catch (error) { showToast(error.message, 'error'); }
}

async function loadApplications() {
    try {
        const data = await API.get(`/admin/applications?page=${currentPage}&page_size=${pageSize}`);
        const rows = data.items.map(application => `
            <tr>
                <td class="px-5 py-4"><strong>${escapeHtml(application.job_title || 'N/A')}</strong><small>${escapeHtml(application.company_name || '')}</small></td>
                <td class="px-5 py-4"><strong>${escapeHtml(application.student_name || 'N/A')}</strong><small>${escapeHtml(application.student_roll_no || '')}</small></td>
                <td class="px-5 py-4"><span class="status-badge status-${application.status}">${application.status}</span>${application.rejection_reason ? `<small class="block text-rose-600 mt-1">${escapeHtml(application.rejection_reason)}</small>` : ''}</td>
                <td class="px-5 py-4 text-slate-500">${formatDate(application.applied_at)}</td>
                <td class="px-5 py-4 text-right">${application.status === 'interviewed' ? `<button class="dashboard-button dashboard-button-primary mr-1" onclick="hireApplication(${application.id})"><i class="bi bi-check2"></i> Hire</button><button class="dashboard-button dashboard-button-secondary" onclick="rejectApplication(${application.id})"><i class="bi bi-x-lg"></i> Reject</button>` : '<span class="text-xs text-slate-400">No decision</span>'}</td>
            </tr>`).join('');
        document.getElementById('tab-content').innerHTML = tableCard('Applications', 'Review candidate progress and record final hiring decisions after interviews.', ['Opportunity', 'Candidate', 'Status', 'Applied', 'Decision'], rows, data.total);
    } catch (error) { showToast(error.message, 'error'); }
}

async function loadHiredStudents() {
    try {
        const data = await API.get(`/admin/applications?status=hired&page=${currentPage}&page_size=${pageSize}`);
        const rows = data.items.map(application => `
            <tr>
                <td class="px-5 py-4"><strong>${escapeHtml(application.student_name || 'N/A')}</strong><small>${escapeHtml(application.student_roll_no || '')}</small></td>
                <td class="px-5 py-4"><strong>${escapeHtml(application.company_name || 'N/A')}</strong></td>
                <td class="px-5 py-4">${escapeHtml(application.job_title || 'N/A')}</td>
                <td class="px-5 py-4 text-slate-500">${formatDate(application.decision_at || application.applied_at)}</td>
                <td class="px-5 py-4"><span class="status-badge status-hired">Hired</span></td>
            </tr>`).join('');
        document.getElementById('tab-content').innerHTML = tableCard('Hired Students', 'Students who have completed the interview process and were hired.', ['Student', 'Company', 'Opportunity', 'Hiring date', 'Status'], rows, data.total);
    } catch (error) { showToast(error.message, 'error'); }
}

async function hireApplication(applicationId) {
    showConfirmModal('Confirm hiring', 'Mark this interviewed candidate as hired?', async () => {
        await API.patch(`/admin/applications/${applicationId}/decision`, { status: 'hired' });
        showToast('Candidate marked as hired');
        await Promise.all([loadStats(), loadApplications()]);
    });
}

function rejectApplication(applicationId) {
    showModal('Reject candidate', `
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Reason for rejection <span class="text-rose-500">*</span></label>
            <textarea id="application-rejection-reason" required rows="5" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#e47b0b]" placeholder="Explain why the candidate was not selected..."></textarea>
        </div>
    `, async () => {
        const reason = document.getElementById('application-rejection-reason')?.value.trim();
        if (!reason) throw new Error('A rejection reason is required');
        await API.patch(`/admin/applications/${applicationId}/decision`, { status: 'rejected', rejection_reason: reason });
        showToast('Candidate rejected with reason recorded');
        await Promise.all([loadStats(), loadApplications()]);
    });
}

window.changePage = function(page, tab) { if (page < 1) return; currentPage = page; window.switchTab(tab); };

function showCreateJobModal() { showAdminJobModal(null, null); }

async function showAdminJobModal(companyId, companyName) {
    const overlay = document.createElement('div'); overlay.id = 'modal-overlay'; overlay.className = 'modal-backdrop';
    overlay.innerHTML = `<form onsubmit="createJob(event)" class="job-modal job-modal-expanded"><div class="job-modal-header"><div><p class="dashboard-kicker">Create opportunity</p><h2>Post a job</h2><p class="job-company-context">Posting on behalf of <strong>${escapeHtml(companyName || 'selected company')}</strong></p></div><button type="button" class="modal-close" onclick="closeModal()">&times;</button></div><input type="hidden" id="job-company-id" value="${companyId}"><div class="job-form-grid"><label>Job title<input id="job-title" required placeholder="e.g. Software Engineer"></label><label>Employment type<select id="job-type"><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="internship">Internship</option><option value="contract">Contract</option><option value="remote">Remote</option></select></label><label>Location<input id="job-location" placeholder="City, Country or Remote"></label><label>Application deadline<input id="job-deadline" type="date"></label><label>Minimum CGPA<input id="job-min-cgpa" type="number" step="0.01" min="0" max="4"></label><label>Required degree<input id="job-degree" placeholder="Bachelor's, Master's..."></label><label>Skill area<select id="job-skill-area"><option value="">Select area</option><option>AI & Data</option><option>Development</option><option>Design</option><option>Marketing</option><option>Business</option><option>Other</option></select></label><label>Required skills<input id="job-skills" placeholder="JavaScript, Python, SQL"></label><label class="job-form-wide">Description<textarea id="job-description" required rows="5" placeholder="Describe the opportunity"></textarea></label><label class="job-form-wide">Requirements<textarea id="job-requirements" rows="4" placeholder="Experience, qualifications, responsibilities"></textarea></label><label>Salary minimum<input id="job-salary-min" type="number" step="0.01"></label><label>Salary maximum<input id="job-salary-max" type="number" step="0.01"></label><label>Status<select id="job-status"><option value="draft">Draft</option><option value="published">Publish now</option></select></label></div><div class="job-modal-actions"><button type="button" onclick="closeModal()" class="dashboard-button dashboard-button-secondary">Cancel</button><button class="dashboard-button dashboard-button-primary">Post job</button></div></form>`; document.body.appendChild(overlay);
}

async function createJob(event) { event.preventDefault(); const skills = document.getElementById('job-skills').value.split(',').map(skill => skill.trim()).filter(Boolean).map(skill_name => ({ skill_name, skill_area: document.getElementById('job-skill-area').value || 'Other' })); const data = { company_id: Number(document.getElementById('job-company-id').value), title: document.getElementById('job-title').value.trim(), description: document.getElementById('job-description').value.trim(), requirements: document.getElementById('job-requirements').value.trim() || null, required_degree: document.getElementById('job-degree').value.trim() || null, location: document.getElementById('job-location').value.trim() || null, employment_type: document.getElementById('job-type').value, min_cgpa: document.getElementById('job-min-cgpa').value ? Number(document.getElementById('job-min-cgpa').value) : null, salary_min: document.getElementById('job-salary-min').value ? Number(document.getElementById('job-salary-min').value) : null, salary_max: document.getElementById('job-salary-max').value ? Number(document.getElementById('job-salary-max').value) : null, application_deadline: document.getElementById('job-deadline').value || null, status: document.getElementById('job-status').value, skills }; try { await API.post('/admin/jobs', data); closeModal(); showToast('Job created for the selected company'); if (window.activeAdminCompany) { const companyId = window.activeAdminCompany.company.id; const [company, overview] = await Promise.all([API.get(`/admin/companies/${companyId}`), API.get(`/admin/companies/${companyId}/overview`)]); window.activeAdminCompany = { company, overview }; switchCompanyWorkspaceTab('jobs'); } else await loadJobs(); } catch (error) { showToast(error.message, 'error'); } }
