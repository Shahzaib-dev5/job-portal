let currentPage = 1;
let currentTab = 'profile';
const pageSize = 10;
let jobCatalog = { areas: [] };
const FALLBACK_JOB_AREAS = ['All areas', 'General', 'Software Development', 'Data Science & AI', 'Cybersecurity', 'Networking & Cloud', 'IT Support', 'QA & Testing', 'DevOps & Cloud', 'Electronics & Embedded Systems', 'Power & Control', 'Business & Management', 'Marketing & Sales', 'Finance & Accounting', 'Engineering & Design', 'Manufacturing & Operations', 'UI/UX & Creative Design', 'Communication & Media'];

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
        const displayDate = profile.establishment_date
            ? new Date(`${profile.establishment_date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : 'Not set';
        const logoHtml = profile.logo_path ? `
            <div class="company-logo-wrap">
                <img src="${getUploadUrl(profile.logo_path)}" alt="Company logo" class="company-logo">
                <div class="company-logo-actions">
                    <button onclick="uploadLogo(true)" title="Edit logo" class="small-btn">Edit</button>
                    <button onclick="deleteLogoNew()" title="Delete logo" class="small-btn danger">Delete</button>
                </div>
            </div>
        ` : '<small>PNG or JPG, up to 5 MB</small>';

        document.getElementById('tab-content').innerHTML = `
            <section class="profile-card company-profile-card">
                <div class="profile-card-header">
                    <div class="company-avatar">${(profile.company_name || 'C').charAt(0).toUpperCase()}</div>
                    <div class="profile-title">
                        <span class="status-badge status-${profile.status}">${profile.status}</span>
                        <h2>${profile.company_name}</h2>
                        <p>${profile.industry || 'Industry not set'} <span>•</span> ${profile.location || 'Location not set'}</p>
                    </div>
                    <button onclick="editProfile()" class="dashboard-button dashboard-button-primary">Edit profile</button>
                </div>

                <div class="company-profile-intro">
                    <div><p class="profile-section-kicker">Company profile</p><h3>Build trust with a complete employer profile</h3><p>Add your organisation’s background and contact information so students can make informed decisions.</p></div>
                    <span class="profile-completion-chip"><i class="bi bi-shield-check"></i> Public profile</span>
                </div>

                <div class="company-profile-sections">
                    <section class="company-profile-section">
                        <div class="profile-section-heading"><span class="profile-section-icon"><i class="bi bi-buildings"></i></span><div><h3>Organisation overview</h3><p>Tell students who you are and what your organisation does.</p></div></div>
                        <div class="profile-details company-profile-details">
                            <div><span>Industry</span><strong>${profile.industry || 'Not set'}</strong></div>
                            <div><span>Established</span><strong>${displayDate}</strong></div>
                            <div><span>Head office</span><strong>${profile.location || 'Not set'}</strong></div>
                            <div><span>Website</span><strong>${profile.website || 'Not set'}</strong></div>
                        </div>
                        <div class="profile-description"><span>About the company</span><p>${profile.description || 'Add a company description so candidates can understand your organisation.'}</p></div>
                    </section>

                    <section class="company-profile-section">
                        <div class="profile-section-heading"><span class="profile-section-icon"><i class="bi bi-person-lines-fill"></i></span><div><h3>Contact & registration</h3><p>Keep your official employer information current.</p></div></div>
                        <div class="profile-details company-profile-details">
                            <div><span>Contact email</span><strong>${profile.contact_email || 'Not set'}</strong></div>
                            <div><span>Phone</span><strong>${profile.contact_phone || 'Not set'}</strong></div>
                            <div><span>SECP number</span><strong>${profile.secp_number || 'Not set'}</strong></div>
                            <div><span>NTN number</span><strong>${profile.ntn_number || 'Not set'}</strong></div>
                        </div>
                    </section>
                </div>

                <div class="profile-actions">
                    <button onclick="uploadLogo()" class="dashboard-button dashboard-button-secondary"><i class="bi bi-image"></i> Upload company logo</button>
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

function profileInput(field, label, value, type = 'text', wide = false) {
    return `<label class="company-form-field${wide ? ' company-form-field-wide' : ''}"><span>${label}</span><input id="profile-${field}" type="${type}" value="${escapeHtml(value || '')}" placeholder="${label}"></label>`;
}
function registrationOption(type, label, value) {
    const selected = Boolean(value);
    return `<div class="registration-option"><label class="registration-check"><input type="checkbox" id="registration-${type}" onchange="toggleRegistrationField('${type}')" ${selected ? 'checked' : ''}><span><i class="bi bi-check2-circle"></i> ${label}</span></label><div id="registration-${type}-field" class="registration-number-field${selected ? '' : ' is-hidden'}"><label class="company-form-field"><span>${label} number</span><input id="profile-${type}_number" value="${escapeHtml(value || '')}" placeholder="Enter ${label} number"></label></div></div>`;
}
function toggleRegistrationField(type) {
    const checkbox = document.getElementById(`registration-${type}`);
    const field = document.getElementById(`registration-${type}-field`);
    if (!checkbox || !field) return;
    field.classList.toggle('is-hidden', !checkbox.checked);
}
function editProfile() {
    API.get('/company/profile').then(p => {
        const form = `
            <div id="modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                <form onsubmit="saveProfile(event)" class="company-profile-edit-modal">
                    <div class="company-edit-header"><div><p class="profile-section-kicker">Company profile</p><h2>Edit organisation details</h2><p>These details help students understand and trust your company.</p></div><button type="button" onclick="closeModal()" class="company-modal-close">&times;</button></div>
                    <div class="company-form-section"><div class="profile-section-heading"><span class="profile-section-icon"><i class="bi bi-buildings"></i></span><div><h3>Organisation overview</h3><p>Basic information about your company.</p></div></div><div class="company-form-grid">${profileInput('company_name', 'Company name', p.company_name, 'text', true)}${profileInput('industry', 'Industry', p.industry)}${profileInput('establishment_date', 'Establishment date', p.establishment_date, 'date')}${profileInput('location', 'Head office location', p.location)}${profileInput('website', 'Company website', p.website, 'url', true)}<label class="company-form-field company-form-field-wide"><span>About the company</span><textarea id="profile-description" rows="4" placeholder="Describe your company, mission, products, and culture">${escapeHtml(p.description || '')}</textarea></label></div></div>
                    <div class="company-form-section"><div class="profile-section-heading"><span class="profile-section-icon"><i class="bi bi-person-lines-fill"></i></span><div><h3>Contact information</h3><p>How students and applicants can reach your team.</p></div></div><div class="company-form-grid">${profileInput('contact_email', 'Contact email', p.contact_email, 'email')}${profileInput('contact_phone', 'Contact phone', p.contact_phone)}</div></div>
                    <div class="company-form-section"><div class="profile-section-heading"><span class="profile-section-icon"><i class="bi bi-patch-check"></i></span><div><h3>Legal registration</h3><p>Select the registration details your company has. You may select one or both.</p></div></div><div class="registration-options">${registrationOption('secp', 'SECP', p.secp_number)}${registrationOption('ntn', 'NTN', p.ntn_number)}</div></div>
                    <div class="company-edit-footer"><button type="button" onclick="closeModal()" class="dashboard-button dashboard-button-secondary">Cancel</button><button class="dashboard-button dashboard-button-primary"><i class="bi bi-check2"></i> Save profile</button></div>
                </form>
            </div>`;
        document.getElementById('tab-content').insertAdjacentHTML('beforeend', form);
    }).catch(error => showToast(error.message, 'error'));
}
async function saveProfile(event) { event.preventDefault(); const data = {}; ['company_name', 'website', 'industry', 'description', 'contact_email', 'contact_phone', 'location', 'establishment_date'].forEach(field => data[field] = document.getElementById(`profile-${field}`).value || null); data.secp_number = document.getElementById('registration-secp')?.checked ? (document.getElementById('profile-secp_number')?.value || null) : null; data.ntn_number = document.getElementById('registration-ntn')?.checked ? (document.getElementById('profile-ntn_number')?.value || null) : null; try { await API.patch('/company/profile', data); closeModal(); showToast('Company profile updated'); renderProfile(); } catch (error) { showToast(error.message, 'error'); } }
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

async function renderJobs() { try { const data = await API.get(`/company/jobs?page=${currentPage}&page_size=${pageSize}`); document.getElementById('tab-content').innerHTML = `${companyBreadcrumb('All jobs')}<section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><header class="flex justify-between border-b p-5"><div><p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Opportunity management</p><h2 class="mt-1 text-lg font-semibold">Jobs</h2></div><button onclick="openJobComposer()" class="rounded-md bg-blue-700 px-3 py-2 text-sm text-white"><i class="bi bi-plus-lg"></i> Post job</button></header><div class="divide-y">${data.items.map(job => `<article class="flex flex-col justify-between gap-3 p-5 sm:flex-row"><div><h3 class="font-semibold">${job.title}</h3><p class="text-sm text-slate-500">${job.required_area || 'All areas'} · ${job.employment_type} · ${job.location || 'Remote'} · ${job.status}</p></div><div class="flex gap-2"><button onclick="viewApplications(${job.id})" class="rounded-md border px-3 py-2 text-sm">Applications</button><select onchange="updateJob(${job.id}, this.value)" class="rounded-md border px-2 py-2 text-sm"><option value="${job.status}">${job.status}</option><option value="published">Publish</option><option value="closed">Close</option><option value="hidden">Hide</option></select></div></article>`).join('') || '<p class="p-5 text-slate-500">No jobs posted.</p>'}</div></section>`; } catch (error) { showToast(error.message, 'error'); } }

let activeJobDraftId = null;
let draftSaveTimer = null;

async function openJobComposer() {
    activeJobDraftId = null;
    composerKeywords = [];
    document.getElementById('tab-content').innerHTML = `
        ${companyBreadcrumb('Post a Job')}
        <section class="job-composer">
            <header class="job-composer-header"><div><p class="dashboard-kicker">New opportunity</p><h2>Create a job posting</h2><p>Build a complete brief and let the portal save your progress automatically.</p></div><span id="draft-save-status" class="draft-save-status"><i class="bi bi-cloud"></i> Not saved yet</span></header>
            <form id="job-composer-form" class="job-composer-form">
                <div class="job-composer-section"><div class="job-section-heading"><span>01</span><div><h3>Role basics</h3><p>Give students a clear first impression of the opportunity.</p></div></div><div class="job-composer-grid"><label class="field-wide">Job title *<input data-draft-field="title" required placeholder="e.g. Junior Backend Engineer"></label><label>Required area *<select id="composer-area" data-draft-field="required_area" required><option value="">Loading areas...</option></select></label><label>Employment type<select data-draft-field="employment_type"><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="internship">Internship</option><option value="contract">Contract</option><option value="remote">Remote</option></select></label><label>Location<input data-draft-field="location" placeholder="City, country or Remote"></label></div></div>
                <div class="job-composer-section"><div class="job-section-heading"><span>02</span><div><h3>Matchmaking keywords</h3><p>Type one or two letters to see related skills, select a suggestion, then press Enter after each keyword.</p></div></div><div class="job-composer-grid"><label class="field-wide keyword-field">Required skills *<input id="composer-skill-input" autocomplete="off" placeholder="Search skills, e.g. Python or JavaScript" aria-describedby="keyword-preview"><div id="skill-suggestion-menu" class="skill-suggestion-menu" role="listbox" hidden></div><div id="composer-skill-chips" class="skill-chip-list"></div></label></div><p id="keyword-preview" class="job-field-note"><i class="bi bi-stars"></i> Add at least 5 keywords. Suggestions are filtered by the selected area.</p></div>
                <div class="job-composer-section"><div class="job-section-heading"><span>03</span><div><h3>Role details</h3><p>Describe responsibilities and the qualifications you expect.</p></div></div><div class="job-composer-grid"><label class="field-wide">Description *<textarea data-draft-field="description" required rows="6" placeholder="Describe the role, team, and day-to-day responsibilities."></textarea></label><label class="field-wide">Requirements<textarea data-draft-field="requirements" rows="5" placeholder="List education, experience, and other requirements."></textarea></label></div></div>
                <div class="job-composer-section"><div class="job-section-heading"><span>04</span><div><h3>Offer details</h3><p>Share practical details before publishing.</p></div></div><div class="job-composer-grid"><label>Minimum CGPA <span class="job-field-note">(optional)</span><input data-draft-field="min_cgpa" type="number" step="0.01" min="0" max="4" placeholder="Leave blank if not required"></label><label>Application deadline<input data-draft-field="application_deadline" type="date"></label><label>Salary minimum<input data-draft-field="salary_min" type="number" step="0.01"></label><label>Salary maximum<input data-draft-field="salary_max" type="number" step="0.01"></label></div></div>
                <footer class="job-composer-actions"><button type="button" onclick="switchTab('jobs')" class="dashboard-button dashboard-button-secondary">Cancel</button><button type="submit" class="dashboard-button dashboard-button-primary"><i class="bi bi-send"></i> Publish job</button></footer>
            </form>
        </section>`;
    const form = document.getElementById('job-composer-form');
    const areaSelect = document.getElementById('composer-area');
    await loadJobCatalog();
    jobCatalog.areas = jobCatalog.areas.length ? jobCatalog.areas : FALLBACK_JOB_AREAS;
    areaSelect.innerHTML = '<option value="">Select area</option><option value="All areas">All areas</option>' + jobCatalog.areas.filter(item => item !== 'All areas').map(item => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('');
    form.querySelectorAll('[data-draft-field]').forEach(field => {
        field.addEventListener('input', () => scheduleDraftSave(field.dataset.draftField, field.value));
        field.addEventListener('change', () => scheduleDraftSave(field.dataset.draftField, field.value));
    });
    loadSkillSuggestions('');
    const skillInput = document.getElementById('composer-skill-input');
    skillInput.addEventListener('focus', event => loadSkillSuggestions(event.target.value.trim()));
    skillInput.addEventListener('input', event => loadSkillSuggestions(event.target.value.trim()));
    areaSelect.addEventListener('change', () => loadSkillSuggestions(skillInput.value.trim()));
    skillInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addComposerKeyword(skillInput.value); } });
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const changes = Object.fromEntries([...form.querySelectorAll('[data-draft-field]')].map(field => [field.dataset.draftField, field.value || null]));
        changes.skills = composerKeywords.map(keyword => ({ skill_area: keyword.area, skill_name: keyword.name }));
        changes.status = 'published';
        if (changes.skills.length < 5) {
            showToast(`Add ${5 - changes.skills.length} more skill keyword${5 - changes.skills.length === 1 ? '' : 's'} before publishing`, 'error');
            document.getElementById('composer-skill-input')?.focus();
            return;
        }
        await saveDraft(changes);
    });
}

let composerKeywords = [];
function addComposerKeyword(value) { const name = value.trim(); if (!name || composerKeywords.some(keyword => keyword.name.toLowerCase() === name.toLowerCase())) return; resolveKeywordArea(name).then(area => { composerKeywords.push({ name, area }); renderComposerKeywords(); document.getElementById('composer-skill-input').value = ''; scheduleSkillsSave(); }); }
function removeComposerKeyword(index) { composerKeywords.splice(index, 1); renderComposerKeywords(); scheduleSkillsSave(); }
function renderComposerKeywords() { const container = document.getElementById('composer-skill-chips'); if (!container) return; container.innerHTML = composerKeywords.map((keyword, index) => `<span class="skill-chip"><span>${escapeHtml(keyword.name)} <small>${escapeHtml(keyword.area)}</small></span><button type="button" aria-label="Remove ${escapeHtml(keyword.name)}" onclick="removeComposerKeyword(${index})"><i class="bi bi-x"></i></button></span>`).join(''); const note = document.getElementById('keyword-preview'); if (note) note.innerHTML = `<i class="bi bi-stars"></i> ${composerKeywords.length}/5 keywords added${composerKeywords.length < 5 ? ' · add ' + (5 - composerKeywords.length) + ' more' : ' · ready to publish'}`; }
async function resolveKeywordArea(name) { try { const suggestions = await API.get(`/skills/suggestions?q=${encodeURIComponent(name)}&limit=20`); const match = suggestions.find(item => item.skill_name.toLowerCase() === name.toLowerCase()); return match?.skill_area || 'Other'; } catch (error) { return 'Other'; } }
function scheduleDraftSave(field, value) { clearTimeout(draftSaveTimer); draftSaveTimer = setTimeout(() => saveDraft({ [field]: value || null }), 500); }
async function loadJobCatalog() { try { jobCatalog = await API.get('/skills/catalog'); } catch (error) { console.debug('Job catalog unavailable', error); } }
async function loadSkillSuggestions(query) {
    const menu = document.getElementById('skill-suggestion-menu');
    if (!menu) return;
    if (!query) { menu.hidden = true; menu.innerHTML = ''; return; }
    try {
        const area = document.getElementById('composer-area')?.value || '';
        const suggestions = await API.get(`/skills/suggestions?q=${encodeURIComponent(query)}&area=${encodeURIComponent(area)}&limit=8`);
        if (!suggestions.length) { menu.hidden = true; menu.innerHTML = ''; return; }
        menu.innerHTML = suggestions.map(item => `<button type="button" class="skill-suggestion-option" role="option" onclick="selectComposerSuggestion('${encodeURIComponent(item.skill_name)}')"><span>${escapeHtml(item.skill_name)}</span><small>${escapeHtml(item.skill_area || 'Other')}</small></button>`).join('');
        menu.hidden = false;
    } catch (error) { menu.hidden = true; console.debug('Skill suggestions unavailable', error); }
}
function selectComposerSuggestion(encodedName) {
    const input = document.getElementById('composer-skill-input');
    const menu = document.getElementById('skill-suggestion-menu');
    if (!input) return;
    input.value = decodeURIComponent(encodedName);
    addComposerKeyword(input.value);
    if (menu) { menu.hidden = true; menu.innerHTML = ''; }
}
function scheduleSkillsSave() { clearTimeout(draftSaveTimer); draftSaveTimer = setTimeout(() => saveDraft({ skills: composerKeywords.map(keyword => ({ skill_area: keyword.area, skill_name: keyword.name })) }), 700); }
async function saveDraft(changes) {
    // Do not create a database row simply because the composer was opened or
    // an empty field was focused. A draft is created only after the employer
    // has entered meaningful content (or selected a skill).
    if (!activeJobDraftId) {
        const draftFields = ['title', 'required_area', 'description', 'requirements', 'location', 'application_deadline', 'min_cgpa', 'salary_min', 'salary_max'];
        const hasContent = (changes.skills && changes.skills.length > 0) || draftFields.some(field => String(changes[field] ?? '').trim());
        if (!hasContent) return;
    }
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
             })).filter(skill => skill.skill_name).filter((skill, index, skills) => skills.findIndex(item => item.skill_name.toLowerCase() === skill.skill_name.toLowerCase()) === index),
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
async function viewStudentApplication(applicationId, studentId) {
    try {
        const [application, student] = await Promise.all([
            API.get(`/company/applications/${applicationId}`),
            API.get(`/company/candidates/${studentId}`)
        ]);
        const skills = (student.skills || []).map(skill => `<span class="student-detail-tag">${escapeHtml(skill.skill_name)}${skill.proficiency ? ` · ${escapeHtml(skill.proficiency)}` : ''}</span>`).join('');
        const photo = student.photo_path ? `<img src="${escapeHtml(getUploadUrl(student.photo_path))}" alt="${escapeHtml(student.name || 'Student')}" class="student-detail-photo">` : `<div class="student-detail-photo student-detail-photo-fallback">${escapeHtml((student.name || 'S').charAt(0).toUpperCase())}</div>`;
        const resumePath = student.resume_path || application.resume_path;
        const resume = resumePath ? `<a href="${escapeHtml(getUploadUrl(resumePath))}" target="_blank" rel="noopener" class="student-detail-resume"><i class="bi bi-file-earmark-pdf"></i> View resume</a>` : '<span class="student-detail-muted">No resume uploaded</span>';
        document.body.insertAdjacentHTML('beforeend', `<div id="student-detail-overlay" class="student-detail-overlay"><div class="student-detail-modal"><div class="student-detail-header"><div><p class="profile-section-kicker">Applicant profile</p><h2>${escapeHtml(student.name || application.student_name || 'Student')}</h2><p>${escapeHtml(application.job_title || 'Job application')}</p></div><button type="button" onclick="closeStudentDetails()" class="company-modal-close">&times;</button></div><div class="student-detail-body"><div class="student-detail-identity">${photo}<div><h3>${escapeHtml(student.name || 'Student')}</h3><p>${escapeHtml(student.roll_no || 'Roll number not provided')}</p><span class="profile-match-badge">${application.match_percentage}% profile match</span></div></div><div class="student-detail-grid"><div><span>Department</span><strong>${escapeHtml(student.department || 'Not provided')}</strong></div><div><span>Semester</span><strong>${escapeHtml(student.semester || 'Not provided')}</strong></div><div><span>Application status</span><strong>${escapeHtml(application.status || 'Applied')}</strong></div><div><span>Applied on</span><strong>${formatDate(application.applied_at)}</strong></div>${student.contact_info?.email ? `<div class="student-detail-wide"><span>Contact email</span><strong>${escapeHtml(student.contact_info.email)}</strong></div>` : ''}</div><section class="student-detail-section"><h3>About the student</h3><p>${escapeHtml(student.bio || 'No biography has been added yet.')}</p></section><section class="student-detail-section"><h3>Skills</h3><div class="student-detail-tags">${skills || '<span class="student-detail-muted">No skills added yet.</span>'}</div></section><section class="student-detail-section"><h3>Application</h3><p class="student-cover-letter">${escapeHtml(application.cover_letter || 'No cover letter was provided.')}</p><div class="student-detail-footer">${resume}<button type="button" onclick="closeStudentDetails(); interview(${application.id})" class="dashboard-button dashboard-button-primary"><i class="bi bi-calendar-plus"></i> Invite to interview</button></div></section></div></div></div>`);
    } catch (error) { showToast(error.message, 'error'); }
}
function closeStudentDetails() { document.getElementById('student-detail-overlay')?.remove(); }
const baseViewApplications = viewApplications;
window.viewApplications = async function (jobId) {
    await baseViewApplications(jobId);
    try {
        const data = await API.get(`/company/jobs/${jobId}/applications?page=1&page_size=100`);
        const rows = document.querySelectorAll('#tab-content article');
        data.items.forEach((item, index) => {
            const row = rows[index];
            if (!row || row.querySelector('.view-student-details')) return;
            const actions = row.querySelector('div:last-child');
            if (actions) actions.insertAdjacentHTML('afterbegin', `<button onclick="viewStudentApplication(${item.id}, ${item.student_id})" class="view-student-details dashboard-button dashboard-button-secondary"><i class="bi bi-person-vcard"></i> View details</button>`);
        });
    } catch (error) { showToast(error.message, 'error'); }
};
function interview(id) {
    document.getElementById('interview-request-overlay')?.remove();
    document.body.insertAdjacentHTML('beforeend', `<div id="interview-request-overlay" class="interview-request-overlay"><form id="interview-request-form" class="interview-request-modal"><div class="interview-request-header"><div class="interview-request-icon"><i class="bi bi-calendar2-check"></i></div><div><p class="profile-section-kicker">Candidate communication</p><h2>Invite to interview</h2><p>Send a professional interview request to this student.</p></div><button type="button" onclick="closeInterviewRequest()" class="company-modal-close">&times;</button></div><div class="interview-request-body"><label class="company-form-field"><span>Interview date and time <em>Optional</em></span><input id="interview-date" type="datetime-local"></label><label class="company-form-field interview-message-field"><span>Message <em>Optional</em></span><textarea id="interview-message" rows="5" maxlength="1000" placeholder="Introduce the interview, explain what the student should prepare, and share any useful details."></textarea><small>Personalised messages help candidates prepare with confidence.</small></label></div><div class="interview-request-footer"><button type="button" onclick="closeInterviewRequest()" class="dashboard-button dashboard-button-secondary">Cancel</button><button type="submit" class="dashboard-button dashboard-button-primary"><i class="bi bi-send"></i> Send invitation</button></div></form></div>`);
    document.getElementById('interview-request-form').addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Sending...';
        try {
            const date = document.getElementById('interview-date').value;
            const message = document.getElementById('interview-message').value.trim();
            await API.post(`/company/applications/${id}/interview-request`, { message: message || null, interview_date: date || null });
            closeInterviewRequest();
            showToast('Interview invitation sent');
        } catch (error) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="bi bi-send"></i> Send invitation';
            showToast(error.message, 'error');
        }
    });
}
function closeInterviewRequest() { document.getElementById('interview-request-overlay')?.remove(); }

async function renderApplications() {
    try {
        const data = await API.get(`/company/jobs?page=1&page_size=100`);
        document.getElementById('tab-content').innerHTML = `<section class="rounded-lg border border-slate-200 bg-white p-6"><h2 class="text-lg font-semibold">Applications by job</h2><div class="mt-4 divide-y">${data.items.map(job => `<button onclick="viewApplications(${job.id})" class="flex w-full items-center justify-between py-4 text-left hover:bg-slate-50"><span>${job.title}</span><span class="text-sm text-blue-700">View applications</span></button>`).join('') || '<p class="py-4 text-slate-500">No jobs available.</p>'}</div></section>`;
    } catch (error) { showToast(error.message, 'error'); }
}
async function renderInterviews() { try { const data = await API.get(`/company/interview-requests?page=${currentPage}&page_size=${pageSize}`); document.getElementById('tab-content').innerHTML = `<section class="space-y-3">${data.items.map(item => `<article class="rounded-lg border bg-white p-5"><b>${item.job_title || 'Job'}</b><p class="text-sm text-slate-500">${item.student_name || 'Student'} · ${item.status} · ${item.interview_date || 'No date'}</p></article>`).join('') || '<p class="text-slate-500">No interviews.</p>'}</section>`; } catch (error) { showToast(error.message, 'error'); } }
async function renderCandidates() { document.getElementById('tab-content').innerHTML = `<section class="rounded-lg border bg-white p-6"><div class="flex gap-3"><input id="candidate-query" placeholder="Name or roll number" class="flex-1 rounded-md border px-3 py-2"><button onclick="searchCandidates()" class="rounded-md bg-blue-700 px-4 py-2 text-white">Search</button></div><div id="candidate-results" class="mt-5"></div></section>`; }
async function searchCandidates() { try { const query = document.getElementById('candidate-query').value; const data = await API.get(`/company/candidates/search?search_term=${encodeURIComponent(query)}&page=1&page_size=20`); document.getElementById('candidate-results').innerHTML = data.items.map(item => `<article class="border-b py-3"><b>${item.name}</b><p class="text-sm text-slate-500">${item.roll_no} · ${item.department}</p></article>`).join('') || '<p class="text-slate-500">No candidates found.</p>'; } catch (error) { showToast(error.message, 'error'); } }






