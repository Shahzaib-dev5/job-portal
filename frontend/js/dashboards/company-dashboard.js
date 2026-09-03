let currentPage = 1;
let currentTab = 'profile';
const pageSize = 10;

function setupCompany() {
    if (!Auth.isAuthenticated()) { window.location.href = '/login.html'; return false; }
    const user = Auth.getUser();
    if (!user || user.role !== 'company') { window.location.href = '/index.html'; return false; }
    const app = document.getElementById('app'); app.appendChild(Navbar.render(user)); document.getElementById('notification-bell').innerHTML = NotificationBell.render(); updateUnreadCount();
    const main = document.createElement('main'); main.className = 'company-dashboard-main mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'; main.innerHTML = `<div class="company-dashboard-banner"><div><p class="dashboard-kicker">Employer workspace</p><h1>Company Dashboard</h1><p>Manage your company profile, opportunities, and candidate conversations.</p></div><a href="/index.html?view=public" onclick="window.location.href='/index.html?view=public'; return false;"><i class="bi bi-arrow-up-right"></i> View portal</a></div><nav class="company-dashboard-tabs" aria-label="Dashboard sections"><button data-tab="profile" onclick="switchTab('profile')" class="tab-btn active">Profile</button><button data-tab="jobs" onclick="switchTab('jobs')" class="tab-btn">Jobs</button><button data-tab="applications" onclick="switchTab('applications')" class="tab-btn">Applications</button><button data-tab="interviews" onclick="switchTab('interviews')" class="tab-btn">Interviews</button><button data-tab="candidates" onclick="switchTab('candidates')" class="tab-btn">Candidates</button></nav><div id="tab-content"></div>`; app.appendChild(main); return true;
}

document.addEventListener('DOMContentLoaded', async () => { if (setupCompany()) await switchTab('profile'); });
window.switchTab = async function(tab) { currentTab = tab; currentPage = 1; document.querySelectorAll('.tab-btn').forEach(button => button.classList.toggle('active', button.dataset.tab === tab)); await ({ profile: renderProfile, jobs: renderJobs, applications: renderApplications, interviews: renderInterviews, candidates: renderCandidates })[tab](); };

async function renderProfile() {
    try {
        const profile = await API.get('/company/profile');
        const logoHtml = profile.logo_path ? `
            <div class="company-logo-wrap">
                <img src="${profile.logo_path}" alt="Company logo" class="company-logo">
                <div class="company-logo-actions">
                    <button onclick="uploadLogo(true)" title="Edit logo" class="small-btn">Edit</button>
                    <button onclick="deleteLogoNew()" title="Delete logo" class="small-btn danger">Delete</button>
                </div>
            </div>
        ` : '<small>PNG or JPG, up to 5 MB</small>';

        document.getElementById('tab-content').innerHTML = `
            <section class="profile-card">
                <div class="profile-card-header">
                    <div class="company-avatar">${(profile.company_name || 'C').charAt(0).toUpperCase()}</div>
                    <div class="profile-title">
                        <span class="status-badge status-${profile.status}">${profile.status}</span>
                        <h2>${profile.company_name}</h2>
                        <p>${profile.industry || 'Industry not set'} <span>•</span> ${profile.location || 'Location not set'}</p>
                    </div>
                    <button onclick="editProfile()" class="dashboard-button dashboard-button-primary">Edit profile</button>
                </div>

                <div class="profile-details">
                    <div><span>Status</span><strong>${profile.status}</strong></div>
                    <div><span>Contact email</span><strong>${profile.contact_email || 'Not set'}</strong></div>
                    <div><span>Website</span><strong>${profile.website || 'Not set'}</strong></div>
                    <div><span>Phone</span><strong>${profile.contact_phone || 'Not set'}</strong></div>
                    <div><span>SECP number</span><strong>${profile.secp_number || 'Not set'}</strong></div>
                    <div><span>NTN number</span><strong>${profile.ntn_number || 'Not set'}</strong></div>
                </div>

                <div class="profile-description"><span>About the company</span><p>${profile.description || 'Add a company description so candidates can understand your organisation.'}</p></div>

                <div class="profile-actions">
                    <button onclick="uploadLogo()" class="dashboard-button dashboard-button-secondary">Upload company logo</button>
                    ${logoHtml}
                    <div id="logo-upload-progress" class="upload-progress" style="display:none;margin-top:8px;">
                        <div class="upload-progress-bar" style="width:0%;height:8px;background:#3b82f6;border-radius:4px"></div>
                        <div id="logo-upload-percent" style="font-size:12px;margin-top:4px;">0%</div>
                    </div>
                </div>
            </section>
        `;
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function deleteLogo() {
    if (!confirm('Delete company logo?')) return;
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    fetch(`${CONFIG.API_BASE_URL}/files/company/logo`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    }).then(async (r) => {
        if (!r.ok) {
            const text = await r.text();
            throw new Error(text || 'Delete failed');
        }
        showToast('Logo removed');
        renderProfile();
    }).catch(err => showToast(err.message || 'Delete failed', 'error'));
}
function deleteLogoNew() {
    if (!confirm('Delete company logo?')) return;
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    fetch(`${CONFIG.API_BASE_URL}/files/company/logo`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    }).then(async (r) => {
        if (!r.ok) {
            const text = await r.text();
            throw new Error(text || 'Delete failed');
        }
        showToast('Logo removed');
        renderProfile();
    }).catch(err => showToast(err.message || 'Delete failed', 'error'));
}

function editProfile() { const fields = ['company_name', 'website', 'industry', 'description', 'contact_email', 'contact_phone', 'location']; Promise.all([API.get('/company/profile')]).then(([p]) => { const values = fields.map(field => `<input id="profile-${field}" placeholder="${field.replace('_', ' ')}" value="${p[field] || ''}" class="w-full rounded-md border px-3 py-2">`).join(''); document.getElementById('tab-content').insertAdjacentHTML('beforeend', `<div id="modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onsubmit="saveProfile(event)" class="w-full max-w-lg space-y-3 rounded-lg bg-white p-6"><h2 class="text-xl font-semibold">Edit profile</h2>${values}<div class="flex justify-end gap-3"><button type="button" onclick="closeModal()" class="rounded-md border px-3 py-2">Cancel</button><button class="rounded-md bg-blue-700 px-3 py-2 text-white">Save</button></div></form></div>`); }); }
async function saveProfile(event) { event.preventDefault(); const data = {}; ['company_name', 'website', 'industry', 'description', 'contact_email', 'contact_phone', 'location'].forEach(field => data[field] = document.getElementById(`profile-${field}`).value || null); try { await API.patch('/company/profile', data); closeModal(); showToast('Profile updated'); renderProfile(); } catch (error) { showToast(error.message, 'error'); } }
function uploadLogo(isEdit = false) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpg,.jpeg,.png';
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast('File too large. Max 5 MB', 'error'); return; }
        const data = new FormData();
        data.append('file', file);

        const progressEl = document.getElementById('logo-upload-progress');
        const bar = progressEl ? progressEl.querySelector('.upload-progress-bar') : null;
        const percent = progressEl ? document.getElementById('logo-upload-percent') : null;
        if (progressEl) { progressEl.style.display = 'block'; if (bar) bar.style.width = '0%'; if (percent) percent.textContent = '0%'; }

        // Use XMLHttpRequest to get upload progress and include Authorization header
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${CONFIG.API_BASE_URL}/files/company/logo`);
        if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable && bar && percent) {
                const p = Math.round((e.loaded / e.total) * 100);
                bar.style.width = p + '%';
                percent.textContent = p + '%';
            }
        };
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                showToast('Logo uploaded');
                renderProfile();
            } else {
                let msg = xhr.responseText || `Upload failed (${xhr.status})`;
                try { msg = JSON.parse(xhr.responseText).detail || msg; } catch (e) {}
                showToast(msg, 'error');
            }
            if (progressEl) progressEl.style.display = 'none';
        };
        xhr.onerror = function () { showToast('Network error during upload', 'error'); if (progressEl) progressEl.style.display = 'none'; };
        xhr.send(data);
    };
    input.click();
}

function companyBreadcrumb(current, backTab = 'jobs') {
    return `<nav class="company-breadcrumb" aria-label="Breadcrumb"><button type="button" onclick="closeModal(); switchTab('profile')"><i class="bi bi-grid-1x2-fill"></i> Company Dashboard</button><i class="bi bi-chevron-right" aria-hidden="true"></i><button type="button" onclick="closeModal(); switchTab('${backTab}')">Jobs</button><i class="bi bi-chevron-right" aria-hidden="true"></i><span aria-current="page">${current}</span></nav>`;
}

async function renderJobs() { try { const data = await API.get(`/company/jobs?page=${currentPage}&page_size=${pageSize}`); document.getElementById('tab-content').innerHTML = `${companyBreadcrumb('All jobs')}<section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><header class="flex justify-between border-b p-5"><div><p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Opportunity management</p><h2 class="mt-1 text-lg font-semibold">Jobs</h2></div><button onclick="openJobComposer()" class="rounded-md bg-blue-700 px-3 py-2 text-sm text-white"><i class="bi bi-plus-lg"></i> Post job</button></header><div class="divide-y">${data.items.map(job => `<article class="flex flex-col justify-between gap-3 p-5 sm:flex-row"><div><h3 class="font-semibold">${job.title}</h3><p class="text-sm text-slate-500">${job.employment_type} · ${job.location || 'Remote'} · ${job.status}</p></div><div class="flex gap-2"><button onclick="viewApplications(${job.id})" class="rounded-md border px-3 py-2 text-sm">Applications</button><select onchange="updateJob(${job.id}, this.value)" class="rounded-md border px-2 py-2 text-sm"><option value="${job.status}">${job.status}</option><option value="published">Publish</option><option value="closed">Close</option><option value="hidden">Hide</option></select></div></article>`).join('') || '<p class="p-5 text-slate-500">No jobs posted.</p>'}</div></section>`; } catch (error) { showToast(error.message, 'error'); } }

let activeJobDraftId = null;
let draftSaveTimer = null;

function openJobComposer() {
    activeJobDraftId = null;
    composerKeywords = [];
    document.getElementById('tab-content').innerHTML = `
        ${companyBreadcrumb('Post a Job')}
        <section class="job-composer">
            <header class="job-composer-header"><div><p class="dashboard-kicker">New opportunity</p><h2>Create a job posting</h2><p>Build a complete brief and let the portal save your progress automatically.</p></div><span id="draft-save-status" class="draft-save-status"><i class="bi bi-cloud"></i> Not saved yet</span></header>
            <form id="job-composer-form" class="job-composer-form">
                <div class="job-composer-section"><div class="job-section-heading"><span>01</span><div><h3>Role basics</h3><p>Give students a clear first impression of the opportunity.</p></div></div><div class="job-composer-grid"><label class="field-wide">Job title *<input data-draft-field="title" required placeholder="e.g. Junior Backend Engineer"></label><label>Employment type<select data-draft-field="employment_type"><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="internship">Internship</option><option value="contract">Contract</option><option value="remote">Remote</option></select></label><label>Location<input data-draft-field="location" placeholder="City, country or Remote"></label></div></div>
                <div class="job-composer-section"><div class="job-section-heading"><span>02</span><div><h3>Matchmaking keywords</h3><p>Search existing skills or type a new keyword. Press Enter after each keyword.</p></div></div><div class="job-composer-grid"><label class="field-wide keyword-field">Required skills *<input id="composer-skill-input" autocomplete="off" placeholder="Type Python, then press Enter"><datalist id="skill-suggestions"></datalist><div id="composer-skill-chips" class="skill-chip-list"></div></label></div><p id="keyword-preview" class="job-field-note"><i class="bi bi-stars"></i> Add at least 5 keywords. Suggestions learn from student profiles and previous job posts.</p></div>
                <div class="job-composer-section"><div class="job-section-heading"><span>03</span><div><h3>Role details</h3><p>Describe responsibilities and the qualifications you expect.</p></div></div><div class="job-composer-grid"><label class="field-wide">Description *<textarea data-draft-field="description" required rows="6" placeholder="Describe the role, team, and day-to-day responsibilities."></textarea></label><label class="field-wide">Requirements<textarea data-draft-field="requirements" rows="5" placeholder="List education, experience, and other requirements."></textarea></label></div></div>
                <div class="job-composer-section"><div class="job-section-heading"><span>04</span><div><h3>Offer details</h3><p>Share practical details before publishing.</p></div></div><div class="job-composer-grid"><label>Minimum CGPA<input data-draft-field="min_cgpa" type="number" step="0.01" min="0" max="4"></label><label>Application deadline<input data-draft-field="application_deadline" type="date"></label><label>Salary minimum<input data-draft-field="salary_min" type="number" step="0.01"></label><label>Salary maximum<input data-draft-field="salary_max" type="number" step="0.01"></label></div></div>
                <footer class="job-composer-actions"><button type="button" onclick="switchTab('jobs')" class="dashboard-button dashboard-button-secondary">Cancel</button><button type="submit" class="dashboard-button dashboard-button-primary"><i class="bi bi-send"></i> Publish job</button></footer>
            </form>
        </section>`;
    const form = document.getElementById('job-composer-form');
    form.querySelectorAll('[data-draft-field]').forEach(field => {
        field.addEventListener('input', () => scheduleDraftSave(field.dataset.draftField, field.value));
        field.addEventListener('change', () => scheduleDraftSave(field.dataset.draftField, field.value));
    });
    loadSkillSuggestions('');
    const skillInput = document.getElementById('composer-skill-input');
    skillInput.addEventListener('input', event => loadSkillSuggestions(event.target.value.trim()));
    skillInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addComposerKeyword(skillInput.value); } });
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const changes = Object.fromEntries([...form.querySelectorAll('[data-draft-field]')].map(field => [field.dataset.draftField, field.value || null]));
        changes.skills = composerKeywords.map(keyword => ({ skill_area: keyword.area, skill_name: keyword.name }));
        changes.status = 'published';
        await saveDraft(changes);
    });
}

let composerKeywords = [];
function addComposerKeyword(value) { const name = value.trim(); if (!name || composerKeywords.some(keyword => keyword.name.toLowerCase() === name.toLowerCase())) return; resolveKeywordArea(name).then(area => { composerKeywords.push({ name, area }); renderComposerKeywords(); document.getElementById('composer-skill-input').value = ''; scheduleSkillsSave(); }); }
function removeComposerKeyword(index) { composerKeywords.splice(index, 1); renderComposerKeywords(); scheduleSkillsSave(); }
function renderComposerKeywords() { const container = document.getElementById('composer-skill-chips'); if (!container) return; container.innerHTML = composerKeywords.map((keyword, index) => `<span class="skill-chip"><span>${escapeHtml(keyword.name)} <small>${escapeHtml(keyword.area)}</small></span><button type="button" aria-label="Remove ${escapeHtml(keyword.name)}" onclick="removeComposerKeyword(${index})"><i class="bi bi-x"></i></button></span>`).join(''); const note = document.getElementById('keyword-preview'); if (note) note.innerHTML = `<i class="bi bi-stars"></i> ${composerKeywords.length}/5 keywords added${composerKeywords.length < 5 ? ' · add ' + (5 - composerKeywords.length) + ' more' : ' · ready to publish'}`; }
async function resolveKeywordArea(name) { try { const suggestions = await API.get(`/skills/suggestions?q=${encodeURIComponent(name)}&limit=20`); const match = suggestions.find(item => item.skill_name.toLowerCase() === name.toLowerCase()); return match?.skill_area || 'Other'; } catch (error) { return 'Other'; } }
function scheduleDraftSave(field, value) { clearTimeout(draftSaveTimer); draftSaveTimer = setTimeout(() => saveDraft({ [field]: value || null }), 500); }
async function loadSkillSuggestions(query) { try { const suggestions = await API.get(`/skills/suggestions?q=${encodeURIComponent(query)}&limit=15`); const list = document.getElementById('skill-suggestions'); if (list) list.innerHTML = suggestions.map(item => `<option value="${escapeHtml(item.skill_name)}">${escapeHtml(item.skill_area)}</option>`).join(''); } catch (error) { console.debug('Skill suggestions unavailable', error); } }
function scheduleSkillsSave() { clearTimeout(draftSaveTimer); draftSaveTimer = setTimeout(() => saveDraft({ skills: composerKeywords.map(keyword => ({ skill_area: keyword.area, skill_name: keyword.name })) }), 700); }
async function saveDraft(changes) {
    try {
        const response = activeJobDraftId ? await API.request(`/company/jobs/${activeJobDraftId}/draft`, { method: 'PATCH', body: JSON.stringify(changes) }) : await API.request('/company/jobs/draft', { method: 'POST', body: JSON.stringify(changes) });
        activeJobDraftId = response.job_id;
        const status = document.getElementById('draft-save-status');
        if (status) status.innerHTML = `<i class="bi bi-cloud-check"></i> Saved to database · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        if (changes.status === 'published') { showToast('Job published'); await switchTab('jobs'); }
    } catch (error) { const status = document.getElementById('draft-save-status'); if (status) status.innerHTML = '<i class="bi bi-exclamation-circle"></i> Save failed'; showToast(error.message, 'error'); }
}
function createJob() {
    // Open a modal with a professional job posting form
    const modalHtml = `
    <div id="modal-overlay" class="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-3xl">
        <form id="job-form" role="dialog" aria-modal="true" class="w-full max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
                    <div class="relative">
                        ${companyBreadcrumb('Post a job')}
                        <h2 class="mt-3 text-xl font-semibold">Post a job</h2>
            <button type="button" aria-label="Close" onclick="closeModal()" class="absolute right-0 top-0 -mt-2 -mr-2 inline-flex items-center justify-center rounded-full bg-slate-100 p-1.5 text-slate-600">×</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <label class="sm:col-span-2">Job title <input id="job-title" required class="w-full rounded-md border px-3 py-2"/></label>

            <label>Employment type
              <select id="job-employment-type" class="w-full rounded-md border px-3 py-2">
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </label>

            <label>Location <input id="job-location" placeholder="City, Country or Remote" class="w-full rounded-md border px-3 py-2"/></label>

            <label>Minimum CGPA (optional) <input id="job-min-cgpa" type="number" step="0.01" min="0" max="4" class="w-full rounded-md border px-3 py-2"/></label>

            <label>Salary min <input id="job-salary-min" type="number" step="0.01" class="w-full rounded-md border px-3 py-2"/></label>
            <label>Salary max <input id="job-salary-max" type="number" step="0.01" class="w-full rounded-md border px-3 py-2"/></label>

            <label>Application deadline <input id="job-deadline" type="date" class="w-full rounded-md border px-3 py-2"/></label>
            <label>Number of openings <input id="job-openings" type="number" min="1" class="w-full rounded-md border px-3 py-2"/></label>

            <label>Required experience (years) <input id="job-experience" type="number" min="0" class="w-full rounded-md border px-3 py-2"/></label>
            <label>Skill area <select id="job-skill-area" required class="w-full rounded-md border px-3 py-2"><option value="">Select area</option><option>AI & Data</option><option>Development</option><option>Design</option><option>Marketing</option><option>Business</option><option>Other</option></select></label>
            <label>Required skills (comma-separated) <input id="job-skills" required placeholder="e.g., JavaScript, Python, SQL" class="w-full rounded-md border px-3 py-2"/></label>

            <label class="sm:col-span-2">Short description (for listing) <input id="job-short" maxlength="200" class="w-full rounded-md border px-3 py-2"/></label>

            <label class="sm:col-span-2">Full description (responsibilities & details)
              <textarea id="job-description" rows="6" class="w-full rounded-md border px-3 py-2"></textarea>
            </label>

            <label class="sm:col-span-2">Requirements (qualifications)
              <textarea id="job-requirements" rows="4" class="w-full rounded-md border px-3 py-2"></textarea>
            </label>

            <label class="sm:col-span-2">Benefits (optional)
              <textarea id="job-benefits" rows="3" class="w-full rounded-md border px-3 py-2"></textarea>
            </label>

            <label>Application URL or email <input id="job-apply-contact" placeholder="https://... or hr@company.com" class="w-full rounded-md border px-3 py-2"/></label>

            <label>Publish now?
              <select id="job-status" class="w-full rounded-md border px-3 py-2">
                <option value="draft">Save as draft</option>
                <option value="published">Publish now</option>
              </select>
            </label>

          </div>

          <div class="mt-4 flex justify-end gap-3">
            <button type="button" onclick="closeModal()" class="rounded-md border px-3 py-2">Cancel</button>
            <button type="submit" class="rounded-md bg-blue-700 px-4 py-2 text-white">Post job</button>
          </div>
        </form>
      </div>
    </div>
    `;

    // append modal to body so it overlays properly and centers on screen
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('job-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const profile = await API.get('/company/profile');
            const payload = {
                title: document.getElementById('job-title').value.trim(),
                description: document.getElementById('job-description').value.trim(),
                requirements: document.getElementById('job-requirements').value.trim() || null,
                location: document.getElementById('job-location').value.trim() || null,
                employment_type: document.getElementById('job-employment-type').value,
                min_cgpa: document.getElementById('job-min-cgpa').value ? parseFloat(document.getElementById('job-min-cgpa').value) : null,
                salary_min: document.getElementById('job-salary-min').value ? parseFloat(document.getElementById('job-salary-min').value) : null,
                salary_max: document.getElementById('job-salary-max').value ? parseFloat(document.getElementById('job-salary-max').value) : null,
                application_deadline: document.getElementById('job-deadline').value || null,
                status: document.getElementById('job-status').value || 'draft',
                company_id: profile.id,
                skills: document.getElementById('job-skills').value.split(',').map(skill => ({
                    skill_area: document.getElementById('job-skill-area').value,
                    skill_name: skill.trim()
                })).filter(skill => skill.skill_name),
            };

            // Basic validation
            if (!payload.title) { showToast('Title is required', 'error'); return; }
            if (!payload.description) { showToast('Description is required', 'error'); return; }
            if (!payload.skills.length || !payload.skills[0].skill_area) { showToast('Select a skill area and add at least one skill', 'error'); return; }

            await API.post('/company/jobs', payload);
            showToast('Job posted');
            closeModal();
            renderJobs();
        } catch (err) {
            showToast(err.message || 'Failed to post job', 'error');
        }
    });
}
async function updateJob(id, status) { try { await API.patch(`/company/jobs/${id}/status`, { status }); showToast('Job updated'); renderJobs(); } catch (error) { showToast(error.message, 'error'); } }
async function viewApplications(jobId) { currentTab = 'applications'; try { const data = await API.get(`/company/jobs/${jobId}/applications?page=1&page_size=100`); document.getElementById('tab-content').innerHTML = `<section class="rounded-lg border border-slate-200 bg-white p-5"><h2 class="text-lg font-semibold">Applications</h2>${data.items.map(item => `<article class="flex flex-wrap items-center justify-between gap-3 border-b py-4"><div><strong>${item.student_name || 'Student'}</strong><p class="text-sm text-slate-500">${item.student_roll_no || ''} · ${item.status}</p><span class="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">${item.match_percentage}% profile match</span></div><div>${item.status === 'applied' ? `<button onclick="shortlist(${item.id})" class="mr-3 text-emerald-700">Shortlist</button>` : ''}<button onclick="interview(${item.id})" class="text-blue-700">Interview</button></div></article>`).join('') || '<p class="py-5 text-slate-500">No applications.</p>'}</section>`; } catch (error) { showToast(error.message, 'error'); } }
async function shortlist(id) { try { await API.post(`/company/applications/${id}/shortlist`); showToast('Candidate shortlisted'); } catch (error) { showToast(error.message, 'error'); } }
async function interview(id) { const message = prompt('Interview message'); try { await API.post(`/company/applications/${id}/interview-request`, { message: message || null, interview_date: null }); showToast('Interview request sent'); } catch (error) { showToast(error.message, 'error'); } }

async function renderApplications() {
    try {
        const data = await API.get(`/company/jobs?page=1&page_size=100`);
        document.getElementById('tab-content').innerHTML = `<section class="rounded-lg border border-slate-200 bg-white p-6"><h2 class="text-lg font-semibold">Applications by job</h2><div class="mt-4 divide-y">${data.items.map(job => `<button onclick="viewApplications(${job.id})" class="flex w-full items-center justify-between py-4 text-left hover:bg-slate-50"><span>${job.title}</span><span class="text-sm text-blue-700">View applications</span></button>`).join('') || '<p class="py-4 text-slate-500">No jobs available.</p>'}</div></section>`;
    } catch (error) { showToast(error.message, 'error'); }
}
async function renderInterviews() { try { const data = await API.get(`/company/interview-requests?page=${currentPage}&page_size=${pageSize}`); document.getElementById('tab-content').innerHTML = `<section class="space-y-3">${data.items.map(item => `<article class="rounded-lg border bg-white p-5"><b>${item.job_title || 'Job'}</b><p class="text-sm text-slate-500">${item.student_name || 'Student'} · ${item.status} · ${item.interview_date || 'No date'}</p></article>`).join('') || '<p class="text-slate-500">No interviews.</p>'}</section>`; } catch (error) { showToast(error.message, 'error'); } }
async function renderCandidates() { document.getElementById('tab-content').innerHTML = `<section class="rounded-lg border bg-white p-6"><div class="flex gap-3"><input id="candidate-query" placeholder="Name or roll number" class="flex-1 rounded-md border px-3 py-2"><button onclick="searchCandidates()" class="rounded-md bg-blue-700 px-4 py-2 text-white">Search</button></div><div id="candidate-results" class="mt-5"></div></section>`; }
async function searchCandidates() { try { const query = document.getElementById('candidate-query').value; const data = await API.get(`/company/candidates/search?search_term=${encodeURIComponent(query)}&page=1&page_size=20`); document.getElementById('candidate-results').innerHTML = data.items.map(item => `<article class="border-b py-3"><b>${item.name}</b><p class="text-sm text-slate-500">${item.roll_no} · ${item.department}</p></article>`).join('') || '<p class="text-slate-500">No candidates found.</p>'; } catch (error) { showToast(error.message, 'error'); } }






