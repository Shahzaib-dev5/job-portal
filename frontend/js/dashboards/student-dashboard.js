let currentPage = 1;
let currentTab = 'profile';
const pageSize = 10;

const SKILL_CATALOG = {
    'AI & Data': ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Data Science', 'Data Analysis', 'NLP', 'Computer Vision'],
    'Development': ['HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Python', 'Java', 'C++', 'Node.js', 'Django', 'FastAPI', 'SQL'],
    'Design': ['UI Design', 'UX Design', 'Figma', 'Graphic Design', 'Motion Design', '3D Design'],
    'Marketing': ['SEO', 'Content Marketing', 'Social Media Marketing', 'Email Marketing', 'Google Ads', 'Market Research'],
    'Business': ['Project Management', 'Business Analysis', 'Financial Analysis', 'Customer Support', 'Sales'],
    'Other': ['Microsoft Office', 'Research', 'Technical Writing', 'Video Editing']
};
const SOFT_SKILL_CATALOG = {
    'Communication': ['Communication', 'Presentation', 'Public Speaking', 'Technical Writing'],
    'Leadership': ['Leadership', 'Team Management', 'Mentoring', 'Decision Making'],
    'Collaboration': ['Teamwork', 'Problem Solving', 'Critical Thinking', 'Conflict Resolution'],
    'Work habits': ['Time Management', 'Adaptability', 'Creativity', 'Attention to Detail']
};

function optionMarkup(values, selected = '') {
    return values.map(value => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('');
}

function areaMarkup(catalog, selected = '') {
    return `<option value="">Select area first</option>${optionMarkup(Object.keys(catalog), selected)}`;
}

function updateSkillOptions(area, selected = '') {
    const select = document.getElementById('skill-name');
    if (!select) return;
    const catalogOptions = optionMarkup(SKILL_CATALOG[area] || [], selected);
    const customSelected = selected && !(SKILL_CATALOG[area] || []).includes(selected);
    select.innerHTML = `<option value="">Select skill</option>${catalogOptions}<option value="__custom__" ${customSelected ? 'selected' : ''}>Other / enter custom skill</option>`;
    select.disabled = !area;
    const custom = document.getElementById('skill-custom-name');
    if (custom) {
        custom.value = customSelected ? selected : '';
        custom.hidden = !customSelected;
        custom.required = customSelected;
    }
}

function updateSoftSkillOptions(area, selected = '') {
    const select = document.getElementById('soft-skill-name');
    if (!select) return;
    const catalogOptions = optionMarkup(SOFT_SKILL_CATALOG[area] || [], selected);
    const customSelected = selected && !(SOFT_SKILL_CATALOG[area] || []).includes(selected);
    select.innerHTML = `<option value="">Select soft skill</option>${catalogOptions}<option value="__custom__" ${customSelected ? 'selected' : ''}>Other / enter custom soft skill</option>`;
    select.disabled = !area;
    const custom = document.getElementById('soft-skill-custom-name');
    if (custom) {
        custom.value = customSelected ? selected : '';
        custom.hidden = !customSelected;
        custom.required = customSelected;
    }
}

function toggleCustomSkill(select, inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const custom = select.value === '__custom__';
    input.hidden = !custom;
    input.required = custom;
    if (!custom) input.value = '';
    if (custom) input.focus();
}

// Add CSS for consistent tab heights
const tabStyles = `
    #tab-content {
        min-height: 500px;
        transition: opacity 0.2s ease;
    }
    .tab-panel {
        height: 100%;
        min-height: 450px;
    }
    .tab-content-section {
        min-height: 450px;
        display: flex;
        flex-direction: column;
    }
    .pagination-wrapper {
        margin-top: auto;
        padding-top: 1rem;
    }
    .profile-card-section > div {
        display: flex;
        flex-direction: column;
    }
    .profile-card-section > div > section {
        flex: 1;
    }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.textContent = tabStyles;
document.head.appendChild(styleSheet);

function shell() {
    if (!Auth.isAuthenticated()) { window.location.href = '/login.html'; return false; }
    const user = Auth.getUser();
    if (!user || user.role !== 'student') { window.location.href = '/index.html'; return false; }
    
    const app = document.getElementById('app');
    app.innerHTML = ''; // Clear out any previous content
    app.appendChild(Navbar.render(user));
    
    // Notifications bell render
    const bell = document.getElementById('notification-bell');
    if (bell) {
        bell.innerHTML = NotificationBell.render();
        updateUnreadCount();
    }
    
    const main = document.createElement('main');
    main.className = 'student-dashboard-main mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8';
    main.innerHTML = `
        <!-- Dashboard Header Banner -->
        <div class="mb-8 bg-gradient-to-r from-[#092d52] to-[#061e38] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border-b-4 border-[#e47b0b]">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-[#e47b0b]/10 rounded-full pointer-events-none"></div>
            <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none"></div>
            <div class="relative z-10">
                <p class="text-xs font-semibold uppercase tracking-widest text-[#e47b0b]">UET Career Portal</p>
                <h1 class="mt-2 text-3xl font-bold tracking-tight">Student Workspace</h1>
                <p class="mt-2 text-sm text-slate-300">Manage your professional profile, search jobs, and track applications.</p>
            </div>
        </div>
        
        <!-- Navigation Tabs -->
        <nav class="mb-6 flex gap-2 overflow-x-auto bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <button data-tab="profile" onclick="switchTab('profile')" class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm bg-[#092d52] text-white border border-[#e47b0b] shadow-sm transition-all">Profile</button>
            <button data-tab="jobs" onclick="switchTab('jobs')" class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-all">Jobs</button>
            <button data-tab="applications" onclick="switchTab('applications')" class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-all">Applications</button>
            <button data-tab="interviews" onclick="switchTab('interviews')" class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-all">Interviews</button>
        </nav>
        
        <div id="tab-content" class="transition-all duration-300"></div>
    `;
    app.appendChild(main);
    return true;
}

document.addEventListener('DOMContentLoaded', async () => { if (shell()) await switchTab('profile'); });

window.switchTab = async function (tab) {
    currentTab = tab; 
    currentPage = 1;
    
    document.querySelectorAll('.tab-btn').forEach(button => {
        const active = button.dataset.tab === tab;
        if (active) {
            button.className = "tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm bg-[#092d52] text-white border border-[#e47b0b] shadow-sm transition-all";
        } else {
            button.className = "tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-all";
        }
    });
    
    // Tab content container ko fixed height ke saath set karein
    const tabContent = document.getElementById('tab-content');
    tabContent.style.minHeight = '500px';
    tabContent.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 space-y-4" style="min-height: 400px;">
            <div class="w-10 h-10 border-4 border-[#092d52] border-t-[#e47b0b] rounded-full animate-spin"></div>
            <p class="text-sm font-medium text-slate-500">Loading content...</p>
        </div>
    `;
    
    try {
        const renderFunctions = {
            profile: renderProfile,
            jobs: renderJobs,
            applications: renderApplications,
            interviews: renderInterviews
        };
        
        await renderFunctions[tab]();
        
        // Content load hone ke baad bhi min-height maintain karein
        const content = document.getElementById('tab-content');
        if (content) {
            content.style.minHeight = '500px';
        }
        
    } catch (err) {
        document.getElementById('tab-content').innerHTML = `
            <div class="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center max-w-lg mx-auto mt-10" style="min-height: 200px;">
                <i class="bi bi-exclamation-octagon text-3xl text-rose-600"></i>
                <h4 class="mt-2 font-bold text-slate-900">Failed to Load Content</h4>
                <p class="mt-1 text-sm text-slate-600">${escapeHtml(err.message)}</p>
                <button onclick="switchTab('${tab}')" class="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#092d52] rounded-md hover:bg-[#061e38]">Retry</button>
            </div>
        `;
    }
};

// HTML Escaper Helper
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Upload URL Helper
function getUploadUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL)
        ? CONFIG.API_BASE_URL.replace(/\/api\/v1\/?$/, '')
        : 'http://localhost:8000';
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return `${baseUrl}${cleanPath}`;
}

// Reusable Dynamic Modal Dialog
function showModal(title, formContent, onSubmit) {
    closeModal();
    const modalHtml = `
        <div id="modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div class="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 animate-slide-up">
                <div class="bg-[#092d52] px-6 py-4 flex justify-between items-center text-white border-b-2 border-[#e47b0b]">
                    <h3 class="text-base font-bold">${escapeHtml(title)}</h3>
                    <button type="button" onclick="closeModal()" class="text-white hover:text-[#e47b0b] text-xl font-bold transition-colors">&times;</button>
                </div>
                <form id="custom-modal-form" class="p-6 space-y-4">
                    ${formContent}
                    <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-[#092d52] border border-[#e47b0b] rounded-md hover:bg-[#061e38] hover:border-[#c86600] transition-all">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('custom-modal-form').onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (submitBtn.disabled) return;
            submitBtn.disabled = true;
            submitBtn.dataset.originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span> Processing...';
        }
        try {
            await onSubmit();
            closeModal();
        } catch (err) {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
            }
            showToast(err.message, 'error');
        }
    };
}

// Reusable Confirmation Dialog
function showConfirmModal(title, message, onConfirm) {
    closeModal();
    const modalHtml = `
        <div id="modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div class="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 p-6 space-y-4">
                <div class="flex items-center gap-3 text-amber-600">
                    <i class="bi bi-exclamation-triangle-fill text-2xl"></i>
                    <h3 class="text-lg font-bold text-slate-950">${escapeHtml(title)}</h3>
                </div>
                <p class="text-sm text-slate-600">${escapeHtml(message)}</p>
                <div class="flex justify-end gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="button" id="confirm-delete-btn" class="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors">Confirm</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('confirm-delete-btn').onclick = async (e) => {
        const btn = e.currentTarget;
        if (btn.disabled) return;
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span> Processing...';
        try {
            await onConfirm();
            closeModal();
        } catch (err) {
            btn.disabled = false;
            btn.innerHTML = originalText;
            showToast(err.message, 'error');
        }
    };
}

async function renderProfile() {
    try {
        const [profile, skills, experiences, certifications, softSkills, achievements] = await Promise.all([
            API.get('/students/me'),
            API.get('/students/me/skills'),
            API.get('/students/me/experiences'),
            API.get('/students/me/certifications'),
            API.get('/students/me/soft-skills'),
            API.get('/students/me/achievements')
        ]);
        
        const tabContent = document.getElementById('tab-content');
        tabContent.style.minHeight = '500px';
        tabContent.innerHTML = `
            <div class="tab-panel">
                <div class="grid gap-6 lg:grid-cols-3 profile-card-section">
                    <!-- Main Content Panel -->
                    <div class="lg:col-span-2 space-y-6">
                        
                        <!-- Profile Card -->
                        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div class="h-2 bg-gradient-to-r from-[#092d52] via-[#e47b0b] to-[#092d52]"></div>
                            <div class="p-6 md:p-8">
                                <div class="flex flex-col sm:flex-row items-center gap-6">
                                    <!-- Photo Container -->
                                    <div class="relative group w-28 h-28 flex-shrink-0">
                                        ${profile.photo_path ? `
                                            <img src="${getUploadUrl(profile.photo_path)}" alt="${escapeHtml(profile.name)}" class="w-full h-full rounded-full object-cover border-4 border-[#e47b0b] shadow-md">
                                            <div class="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2.5 transition-all duration-200">
                                                <button onclick="uploadFile('photo')" class="text-white hover:text-[#e47b0b] transition-colors" title="Change Photo"><i class="bi bi-camera-fill text-lg"></i></button>
                                                <button onclick="deletePhoto()" class="text-white hover:text-rose-500 transition-colors" title="Delete Photo"><i class="bi bi-trash-fill text-lg"></i></button>
                                            </div>
                                        ` : `
                                            <div class="w-full h-full rounded-full bg-[#092d52] border-4 border-[#e47b0b] shadow-md flex items-center justify-center text-white text-3xl font-bold uppercase">
                                                ${profile.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'UET'}
                                            </div>
                                            <div class="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                                                <button onclick="uploadFile('photo')" class="text-white hover:text-[#e47b0b] transition-colors" title="Upload Photo"><i class="bi bi-camera-fill text-xl"></i></button>
                                            </div>
                                        `}
                                    </div>
                                    
                                    <!-- Student Info -->
                                    <div class="text-center sm:text-left flex-1 min-w-0">
                                        <div class="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">${escapeHtml(profile.name)}</h2>
                                            <span class="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">${escapeHtml(profile.availability || 'Open to opportunities')}</span>
                                        </div>
                                        <p class="text-sm font-semibold text-slate-600 mt-1">${escapeHtml(profile.professional_title || 'Add a professional title')}</p>
                                        <p class="text-sm font-semibold text-[#e47b0b] mt-0.5">${escapeHtml(profile.department)}</p>
                                        <div class="mt-2.5 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                                            <span><i class="bi bi-hash mr-1"></i>${escapeHtml(profile.roll_no)}</span>
                                            <span class="hidden sm:inline text-slate-300">|</span>
                                            <span><i class="bi bi-journal-bookmark mr-1"></i>Semester ${escapeHtml(profile.semester)}</span>
                                            <span class="hidden sm:inline text-slate-300">|</span>
                                            <span><i class="bi bi-envelope mr-1"></i>${escapeHtml(profile.email)}</span>
                                            ${profile.location ? `<span class="hidden sm:inline text-slate-300">|</span><span><i class="bi bi-geo-alt mr-1"></i>${escapeHtml(profile.location)}</span>` : ''}
                                        </div>
                                    </div>
                                    <button onclick="editProfileDetails()" class="self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-[#092d52] hover:border-[#e47b0b] hover:bg-orange-50 transition-colors">
                                        <i class="bi bi-pencil-square mr-1"></i> Edit profile
                                    </button>
                                </div>
                                
                                <!-- Professional Bio -->
                                <div class="mt-8 pt-6 border-t border-slate-100">
                                    <div class="flex justify-between items-center mb-2">
                                        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Professional Bio</h3>
                                        <button onclick="editProfileDetails()" class="text-xs font-bold text-[#092d52] hover:text-[#e47b0b] flex items-center gap-1 transition-colors">
                                            <i class="bi bi-pencil-square"></i> Edit
                                        </button>
                                    </div>
                                    <p class="text-slate-700 text-sm leading-relaxed">${escapeHtml(profile.bio || 'No professional bio added yet. Click Edit to add one and showcase your career goals.')}</p>
                                </div>
                            </div>
                        </section>

                        <!-- Marketplace Profile Details -->
                        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div class="flex items-center justify-between gap-4">
                                <div>
                                    <h3 class="text-base font-bold text-slate-900 flex items-center gap-2"><i class="bi bi-person-badge text-xl text-[#092d52]"></i> Marketplace profile</h3>
                                    <p class="mt-1 text-xs text-slate-500">Help employers understand what you offer and how to contact you.</p>
                                </div>
                                <button onclick="editProfileDetails()" class="rounded-lg bg-[#092d52] px-3 py-2 text-xs font-bold text-white hover:bg-[#061e38]"><i class="bi bi-pencil mr-1"></i> Edit</button>
                            </div>
                            <div class="mt-5 grid gap-4 sm:grid-cols-3">
                                <div><span class="profile-meta-label">Availability</span><strong class="profile-meta-value">${escapeHtml(profile.availability || 'Not set')}</strong></div>
                                <div><span class="profile-meta-label">Hourly rate</span><strong class="profile-meta-value">${profile.hourly_rate ? `$${Number(profile.hourly_rate).toFixed(2)} / hr` : 'Not set'}</strong></div>
                                <div><span class="profile-meta-label">Languages</span><strong class="profile-meta-value">${escapeHtml(profile.languages || 'Not set')}</strong></div>
                            </div>
                            <div class="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                                ${profile.portfolio_url ? `<a href="${escapeHtml(profile.portfolio_url)}" target="_blank" rel="noopener" class="profile-link"><i class="bi bi-globe2"></i> Portfolio</a>` : ''}
                                ${profile.github_url ? `<a href="${escapeHtml(profile.github_url)}" target="_blank" rel="noopener" class="profile-link"><i class="bi bi-github"></i> GitHub</a>` : ''}
                                ${profile.linkedin_url ? `<a href="${escapeHtml(profile.linkedin_url)}" target="_blank" rel="noopener" class="profile-link"><i class="bi bi-linkedin"></i> LinkedIn</a>` : ''}
                                ${!profile.portfolio_url && !profile.github_url && !profile.linkedin_url ? '<span class="text-xs text-slate-400">Add portfolio links to showcase your work.</span>' : ''}
                            </div>
                        </section>
                        
                        <!-- Resume Card -->
                        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <i class="bi bi-file-earmark-text text-xl text-[#092d52]"></i> Resume / CV
                            </h3>
                            ${profile.resume_path ? `
                                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                                    <div class="flex items-center gap-3">
                                        <div class="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                                            <i class="bi bi-file-earmark-pdf-fill text-2xl"></i>
                                        </div>
                                        <div class="min-w-0">
                                            <p class="text-sm font-semibold text-slate-800 truncate">Resume_${escapeHtml(profile.name.replace(/\s+/g, '_'))}.pdf</p>
                                            <a href="${getUploadUrl(profile.resume_path)}" target="_blank" class="text-xs font-bold text-[#092d52] hover:text-[#e47b0b] inline-flex items-center gap-1 mt-0.5 transition-colors">
                                                <i class="bi bi-eye"></i> View PDF
                                            </a>
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="uploadFile('resume')" class="p-2 text-slate-500 hover:text-[#092d52] rounded-lg hover:bg-slate-100 transition-all" title="Re-upload Resume">
                                            <i class="bi bi-arrow-repeat text-lg"></i>
                                        </button>
                                        <button onclick="deleteResume()" class="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all" title="Delete Resume">
                                            <i class="bi bi-trash-fill text-lg"></i>
                                        </button>
                                    </div>
                                </div>
                            ` : `
                                <div class="text-center py-6 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                    <i class="bi bi-cloud-arrow-up text-3xl text-slate-400"></i>
                                    <h4 class="mt-2 text-sm font-bold text-slate-800">No Resume Uploaded</h4>
                                    <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Upload your resume (PDF/DOC/DOCX) to apply for job postings and stand out to employers.</p>
                                    <button onclick="uploadFile('resume')" class="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#092d52] rounded-md hover:bg-[#061e38] transition-colors shadow-sm">
                                        Upload Resume
                                    </button>
                                </div>
                            `}
                        </section>

                        <!-- Experiences Card -->
                        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <i class="bi bi-briefcase text-xl text-[#092d52]"></i> Work Experience
                                </h3>
                                <button onclick="showExperienceModal()" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#092d52] border border-[#e47b0b] rounded-lg hover:bg-[#061e38] transition-all flex items-center gap-1 shadow-sm">
                                    <i class="bi bi-plus-lg"></i> Add
                                </button>
                            </div>
                            <div class="space-y-4">
                                ${experiences.length > 0 ? experiences.map(exp => `
                                    <div class="relative p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-all group">
                                        <div class="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onclick="showExperienceModal(${JSON.stringify(exp).replace(/"/g, '&quot;')})" class="p-1 text-slate-400 hover:text-[#092d52] rounded hover:bg-slate-100 transition-all" title="Edit">
                                                <i class="bi bi-pencil-fill text-xs"></i>
                                            </button>
                                            <button onclick="deleteExperience(${exp.id}, '${exp.company_name}')" class="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-all" title="Delete">
                                                <i class="bi bi-trash-fill text-xs"></i>
                                            </button>
                                        </div>
                                        
                                        <h4 class="font-bold text-slate-900 pr-16 text-sm sm:text-base">${escapeHtml(exp.title)}</h4>
                                        <p class="text-sm font-semibold text-[#e47b0b] mt-0.5">${escapeHtml(exp.company_name)}</p>
                                        <p class="text-xs text-slate-500 font-medium mt-1">
                                            <i class="bi bi-calendar-event mr-1"></i>
                                            ${formatDate(exp.start_date)} - ${exp.end_date ? formatDate(exp.end_date) : '<span class="text-emerald-600 font-bold">Present</span>'}
                                        </p>
                                        ${exp.description ? `
                                            <p class="text-xs text-slate-600 mt-2.5 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-100/50">${escapeHtml(exp.description)}</p>
                                        ` : ''}
                                    </div>
                                `).join('') : `
                                    <div class="text-center py-8 text-slate-500 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
                                        <i class="bi bi-briefcase text-2xl text-slate-300"></i>
                                        <p class="text-sm mt-1.5 font-medium">No experience added yet.</p>
                                    </div>
                                `}
                            </div>
                        </section>
                        
                        <!-- Achievements Card -->
                        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <i class="bi bi-trophy text-xl text-[#092d52]"></i> Achievements & Awards
                                </h3>
                                <button onclick="showAchievementModal()" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#092d52] border border-[#e47b0b] rounded-lg hover:bg-[#061e38] transition-all flex items-center gap-1 shadow-sm">
                                    <i class="bi bi-plus-lg"></i> Add
                                </button>
                            </div>
                            <div class="space-y-4">
                                ${achievements.length > 0 ? achievements.map(ach => `
                                    <div class="relative p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-all group">
                                        <div class="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onclick="showAchievementModal(${JSON.stringify(ach).replace(/"/g, '&quot;')})" class="p-1 text-slate-400 hover:text-[#092d52] rounded hover:bg-slate-100 transition-all" title="Edit">
                                                <i class="bi bi-pencil-fill text-xs"></i>
                                            </button>
                                            <button onclick="deleteAchievement(${ach.id}, '${ach.title}')" class="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-all" title="Delete">
                                                <i class="bi bi-trash-fill text-xs"></i>
                                            </button>
                                        </div>
                                        
                                        <h4 class="font-bold text-slate-900 pr-16 text-sm sm:text-base">${escapeHtml(ach.title)}</h4>
                                        ${ach.date ? `
                                            <p class="text-xs text-slate-500 font-medium mt-1">
                                                <i class="bi bi-calendar-event mr-1"></i>
                                                ${formatDate(ach.date)}
                                            </p>
                                        ` : ''}
                                        ${ach.description ? `
                                            <p class="text-xs text-slate-600 mt-2.5 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-100/50">${escapeHtml(ach.description)}</p>
                                        ` : ''}
                                    </div>
                                `).join('') : `
                                    <div class="text-center py-8 text-slate-500 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
                                        <i class="bi bi-trophy text-2xl text-slate-300"></i>
                                        <p class="text-sm mt-1.5 font-medium">No achievements added yet.</p>
                                    </div>
                                `}
                            </div>
                        </section>
                    </div>
                    
                    <!-- Sidebar -->
                    <div class="space-y-6">
                        
                        <!-- Technical Skills -->
                        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                    <i class="bi bi-code-slash text-base text-[#092d52]"></i> Technical Skills
                                </h3>
                                <button onclick="showSkillModal()" class="text-xs font-bold text-[#092d52] hover:text-[#e47b0b] flex items-center gap-0.5 transition-colors">
                                    <i class="bi bi-plus-lg"></i> Add
                                </button>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                ${skills.length > 0 ? skills.map(item => `
                                    <div class="skill-item rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                                        <div class="flex items-center justify-between gap-2">
                                            <div class="min-w-0"><p class="truncate text-sm font-semibold text-[#092d52]">${escapeHtml(item.skill_name)}</p><p class="text-[10px] uppercase tracking-wide text-slate-400">${escapeHtml(item.skill_area || 'Other')} · ${escapeHtml(item.proficiency || 'Proficiency not set')}</p></div>
                                            <div class="flex shrink-0 gap-1"><button onclick="showSkillModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" class="p-1.5 text-slate-400 hover:text-[#092d52]" title="Edit skill"><i class="bi bi-pencil-fill text-xs"></i></button><button onclick="deleteSkill(${item.id}, '${escapeHtml(item.skill_name)}')" class="p-1.5 text-slate-400 hover:text-rose-600" title="Delete skill"><i class="bi bi-trash-fill text-xs"></i></button></div>
                                        </div>
                                        <div class="mt-2 flex items-center gap-2"><div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><div class="h-full rounded-full bg-[#e47b0b]" style="width:${item.proficiency_percent ?? 0}%"></div></div><span class="w-9 text-right text-xs font-bold text-slate-500">${item.proficiency_percent ?? 0}%</span></div>
                                    </div>
                                `).join('') : `
                                    <p class="text-xs text-slate-400">No technical skills added yet.</p>
                                `}
                            </div>
                        </section>
                        
                        <!-- Soft Skills -->
                        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                    <i class="bi bi-people text-base text-[#092d52]"></i> Soft Skills
                                </h3>
                                <button onclick="showSoftSkillModal()" class="text-xs font-bold text-[#092d52] hover:text-[#e47b0b] flex items-center gap-0.5 transition-colors">
                                    <i class="bi bi-plus-lg"></i> Add
                                </button>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                ${softSkills.length > 0 ? softSkills.map(item => `
                                    <div class="skill-item rounded-xl border border-orange-100 bg-orange-50/40 p-3">
                                        <div class="flex items-center justify-between gap-2"><div class="min-w-0"><p class="truncate text-sm font-semibold text-[#e47b0b]">${escapeHtml(item.skill_name)}</p><p class="text-[10px] uppercase tracking-wide text-slate-400">${escapeHtml(item.skill_area || 'Other')}</p></div><div class="flex shrink-0 gap-1"><button onclick="showSoftSkillModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" class="p-1.5 text-slate-400 hover:text-[#e47b0b]" title="Edit soft skill"><i class="bi bi-pencil-fill text-xs"></i></button><button onclick="deleteSoftSkill(${item.id}, '${escapeHtml(item.skill_name)}')" class="p-1.5 text-slate-400 hover:text-rose-600" title="Delete soft skill"><i class="bi bi-trash-fill text-xs"></i></button></div></div>
                                        <div class="mt-2 flex items-center gap-2"><div class="h-2 flex-1 overflow-hidden rounded-full bg-orange-100"><div class="h-full rounded-full bg-[#e47b0b]" style="width:${item.proficiency_percent ?? 0}%"></div></div><span class="w-9 text-right text-xs font-bold text-slate-500">${item.proficiency_percent ?? 0}%</span></div>
                                    </div>
                                `).join('') : `
                                    <p class="text-xs text-slate-400">No soft skills added yet.</p>
                                `}
                            </div>
                        </section>
                        
                        <!-- Certifications -->
                        <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                    <i class="bi bi-patch-check text-base text-[#092d52]"></i> Certifications
                                </h3>
                                <button onclick="showCertificationModal()" class="text-xs font-bold text-[#092d52] hover:text-[#e47b0b] flex items-center gap-0.5 transition-colors">
                                    <i class="bi bi-plus-lg"></i> Add
                                </button>
                            </div>
                            <div class="space-y-3">
                                ${certifications.length > 0 ? certifications.map(cert => `
                                    <div class="relative group p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                                        <div class="flex justify-between items-start">
                                            <div class="min-w-0 pr-6">
                                                <h4 class="font-bold text-slate-800 text-sm truncate">${escapeHtml(cert.name)}</h4>
                                                ${cert.issuer ? `<p class="text-xs text-[#e47b0b] font-semibold mt-0.5 truncate">${escapeHtml(cert.issuer)}</p>` : ''}
                                                ${cert.issue_date ? `
                                                    <p class="text-[10px] text-slate-400 mt-1 font-medium">
                                                        <i class="bi bi-calendar3 mr-1"></i>
                                                        ${formatDate(cert.issue_date)}${cert.expiry_date ? ` - ${formatDate(cert.expiry_date)}` : ''}
                                                    </p>
                                                ` : ''}
                                                ${cert.credential_url ? `<a href="${escapeHtml(cert.credential_url)}" target="_blank" rel="noopener" class="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#092d52] hover:text-[#e47b0b]"><i class="bi bi-box-arrow-up-right"></i> View credential</a>` : ''}
                                            </div>
                                            <button onclick="deleteCertification(${cert.id}, '${cert.name}')" class="absolute right-3 top-3.5 text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
                                                <i class="bi bi-trash-fill text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('') : `
                                    <p class="text-xs text-slate-400">No certifications added yet.</p>
                                `}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Edit Bio Modal Form
function editBio(bio) {
    const formHtml = `
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
            <textarea id="profile-bio-input" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm h-32 resize-none" placeholder="Write a short professional bio...">${escapeHtml(bio || '')}</textarea>
        </div>
    `;
    showModal('Edit Bio', formHtml, async () => {
        const val = document.getElementById('profile-bio-input').value;
        await API.put('/students/me', { bio: val });
        showToast('Bio updated successfully');
        renderProfile();
    });
}

async function editProfileDetails() {
    const profile = await API.get('/students/me');
    const formHtml = `
        <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm font-semibold text-slate-700">Professional title<input id="market-title" value="${escapeHtml(profile.professional_title || '')}" placeholder="Frontend developer" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"></label>
            <label class="block text-sm font-semibold text-slate-700">Location<input id="market-location" value="${escapeHtml(profile.location || '')}" placeholder="Lahore, Pakistan" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"></label>
            <label class="block text-sm font-semibold text-slate-700">Hourly rate (USD)<input id="market-rate" type="number" min="0" step="0.01" value="${profile.hourly_rate || ''}" placeholder="25" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"></label>
            <label class="block text-sm font-semibold text-slate-700">Availability<select id="market-availability" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="">Select availability</option><option ${profile.availability === 'Available now' ? 'selected' : ''}>Available now</option><option ${profile.availability === 'Part-time' ? 'selected' : ''}>Part-time</option><option ${profile.availability === 'Not available' ? 'selected' : ''}>Not available</option></select></label>
            <label class="block text-sm font-semibold text-slate-700 sm:col-span-2">Languages<input id="market-languages" value="${escapeHtml(profile.languages || '')}" placeholder="English, Urdu, Punjabi" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"></label>
            <label class="block text-sm font-semibold text-slate-700 sm:col-span-2">Professional bio<textarea id="market-bio" class="mt-1 h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Describe your strengths, experience, and goals">${escapeHtml(profile.bio || '')}</textarea></label>
            <label class="block text-sm font-semibold text-slate-700">Portfolio URL<input id="market-portfolio" type="url" value="${escapeHtml(profile.portfolio_url || '')}" placeholder="https://yourportfolio.com" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"></label>
            <label class="block text-sm font-semibold text-slate-700">GitHub URL<input id="market-github" type="url" value="${escapeHtml(profile.github_url || '')}" placeholder="https://github.com/username" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"></label>
            <label class="block text-sm font-semibold text-slate-700 sm:col-span-2">LinkedIn URL<input id="market-linkedin" type="url" value="${escapeHtml(profile.linkedin_url || '')}" placeholder="https://linkedin.com/in/username" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"></label>
        </div>
    `;
    showModal('Edit marketplace profile', formHtml, async () => {
        const rate = document.getElementById('market-rate').value;
        await API.put('/students/me', {
            professional_title: document.getElementById('market-title').value,
            location: document.getElementById('market-location').value,
            hourly_rate: rate ? Number(rate) : null,
            availability: document.getElementById('market-availability').value,
            languages: document.getElementById('market-languages').value,
            bio: document.getElementById('market-bio').value,
            portfolio_url: document.getElementById('market-portfolio').value,
            github_url: document.getElementById('market-github').value,
            linkedin_url: document.getElementById('market-linkedin').value
        });
        showToast('Profile updated successfully');
        renderProfile();
    });
}

// Dynamic photo/resume file uploader
function uploadFile(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'resume' ? '.pdf,.doc,.docx' : '.jpg,.jpeg,.png';
    input.onchange = async () => {
        if (!input.files[0]) return;
        const data = new FormData();
        data.append('file', input.files[0]);
        
        const loadingToast = document.createElement('div');
        loadingToast.className = "fixed bottom-4 right-4 z-50 rounded-md px-5 py-3 text-white bg-blue-700 shadow-lg flex items-center gap-2";
        loadingToast.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Uploading ${type}...`;
        document.body.appendChild(loadingToast);
        
        try {
            await API.upload(`/students/me/${type}`, data);
            loadingToast.remove();
            showToast(`${type} uploaded successfully`);
            renderProfile();
        } catch (error) {
            loadingToast.remove();
            showToast(error.message, 'error');
        }
    };
    input.click();
}

// Delete Profile Picture Confirmation
function deletePhoto() {
    showConfirmModal('Delete Profile Picture', 'Are you sure you want to delete your profile picture?', async () => {
        await API.delete('/students/me/photo');
        showToast('Profile picture deleted');
        renderProfile();
    });
}

// Delete Resume Confirmation
function deleteResume() {
    showConfirmModal('Delete Resume', 'Are you sure you want to delete your resume?', async () => {
        await API.delete('/students/me/resume');
        showToast('Resume deleted');
        renderProfile();
    });
}

// Skill Modal Form
function showSkillModal(skill = null) {
    const isEdit = Boolean(skill);
    const formHtml = `
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Skill area <span class="text-rose-500">*</span></label>
            <select id="skill-area" required onchange="updateSkillOptions(this.value)" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="">Select area first</option>${optionMarkup(Object.keys(SKILL_CATALOG), skill?.skill_area || '')}</select>
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Skill <span class="text-rose-500">*</span></label>
            <select id="skill-name" required onchange="toggleCustomSkill(this, 'skill-custom-name')" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="">Select skill</option></select>
            <input id="skill-custom-name" type="text" hidden placeholder="Enter your skill" class="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Proficiency</label>
            <select id="skill-proficiency" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
                <option value="">Select proficiency</option>
                <option value="beginner" ${skill?.proficiency === 'beginner' ? 'selected' : ''}>Beginner</option>
                <option value="intermediate" ${skill?.proficiency === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                <option value="advanced" ${skill?.proficiency === 'advanced' ? 'selected' : ''}>Advanced</option>
                <option value="expert" ${skill?.proficiency === 'expert' ? 'selected' : ''}>Expert</option>
            </select>
        </div>
        <div>
            <div class="mb-1 flex items-center justify-between"><label for="skill-percent" class="block text-sm font-semibold text-slate-700">Skill percentage</label><output id="skill-percent-value" class="text-sm font-bold text-[#e47b0b]">${skill?.proficiency_percent ?? 0}%</output></div>
            <input id="skill-percent" type="range" min="0" max="100" step="1" value="${skill?.proficiency_percent ?? 0}" class="w-full accent-[#e47b0b]">
        </div>
    `;
    showModal(isEdit ? 'Edit Skill' : 'Add Skill', formHtml, async () => {
        const body = {
            skill_area: document.getElementById('skill-area').value,
            skill_name: document.getElementById('skill-name').value === '__custom__' ? document.getElementById('skill-custom-name').value.trim() : document.getElementById('skill-name').value,
            proficiency: document.getElementById('skill-proficiency').value || null,
            proficiency_percent: Number(document.getElementById('skill-percent').value)
        };
        if (isEdit) {
            await API.put(`/students/me/skills/${skill.id}`, { skill_area: body.skill_area, proficiency: body.proficiency, proficiency_percent: body.proficiency_percent });
            showToast('Skill updated successfully');
        } else {
            await API.post('/students/me/skills', body);
            showToast('Skill added successfully');
        }
        renderProfile();
    });
    const range = document.getElementById('skill-percent');
    const output = document.getElementById('skill-percent-value');
    if (range && output) range.addEventListener('input', () => { output.value = `${range.value}%`; output.textContent = `${range.value}%`; });
    if (skill?.skill_area) updateSkillOptions(skill.skill_area, skill.skill_name);
}

// Delete Skill Confirmation
function deleteSkill(id, name) {
    showConfirmModal('Delete Skill', `Are you sure you want to delete the skill "${name}"?`, async () => {
        await API.delete(`/students/me/skills/${id}`);
        showToast('Skill deleted');
        renderProfile();
    });
}

// Soft Skill Modal Form
function showSoftSkillModal(skill = null) {
    const formHtml = `
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Soft skill area <span class="text-rose-500">*</span></label>
            <select id="soft-skill-area" required onchange="updateSoftSkillOptions(this.value)" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="">Select area first</option>${optionMarkup(Object.keys(SOFT_SKILL_CATALOG), skill?.skill_area || '')}</select>
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Soft skill <span class="text-rose-500">*</span></label>
            <select id="soft-skill-name" required onchange="toggleCustomSkill(this, 'soft-skill-custom-name')" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"><option value="">Select soft skill</option></select>
            <input id="soft-skill-custom-name" type="text" hidden placeholder="Enter your soft skill" class="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
        </div>
        <div>
            <div class="mb-1 flex items-center justify-between"><label for="soft-skill-percent" class="block text-sm font-semibold text-slate-700">Skill percentage</label><output id="soft-skill-percent-value" class="text-sm font-bold text-[#e47b0b]">${skill?.proficiency_percent ?? 0}%</output></div>
            <input id="soft-skill-percent" type="range" min="0" max="100" step="1" value="${skill?.proficiency_percent ?? 0}" class="w-full accent-[#e47b0b]">
        </div>
    `;
    showModal(skill ? 'Edit Soft Skill' : 'Add Soft Skill', formHtml, async () => {
        const body = {
            skill_area: document.getElementById('soft-skill-area').value,
            proficiency_percent: Number(document.getElementById('soft-skill-percent').value),
            skill_name: document.getElementById('soft-skill-name').value === '__custom__' ? document.getElementById('soft-skill-custom-name').value.trim() : document.getElementById('soft-skill-name').value
        };
        if (skill) {
            await API.put(`/students/me/soft-skills/${skill.id}`, { skill_area: body.skill_area, proficiency_percent: body.proficiency_percent });
            showToast('Soft skill updated successfully');
        } else {
            await API.post('/students/me/soft-skills', body);
            showToast('Soft skill added successfully');
        }
        renderProfile();
    });
    const range = document.getElementById('soft-skill-percent');
    const output = document.getElementById('soft-skill-percent-value');
    if (range && output) range.addEventListener('input', () => { output.value = `${range.value}%`; output.textContent = `${range.value}%`; });
    if (skill?.skill_area) updateSoftSkillOptions(skill.skill_area, skill.skill_name);
}

// Delete Soft Skill Confirmation
function deleteSoftSkill(id, name) {
    showConfirmModal('Delete Soft Skill', `Are you sure you want to delete the soft skill "${name}"?`, async () => {
        await API.delete(`/students/me/soft-skills/${id}`);
        showToast('Soft skill deleted');
        renderProfile();
    });
}

// Date formatting helper for API payloads
function formatDateForAPI(date) {
    if (!date) return null;
    if (typeof date !== 'string') return null;
    date = date.trim();
    if (!date) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

    const parts = date.split(/[\/\.-]/);
    if (parts.length === 3) {
        let year, month, day;
        if (parts[0].length === 4) {
            year = parts[0];
            month = parts[1].padStart(2, '0');
            day = parts[2].padStart(2, '0');
        } else if (parts[2].length === 4) {
            year = parts[2];
            let p0 = parseInt(parts[0], 10);
            let p1 = parseInt(parts[1], 10);
            if (p0 > 12 && p1 <= 12) {
                day = parts[0].padStart(2, '0');
                month = parts[1].padStart(2, '0');
            } else {
                month = parts[0].padStart(2, '0');
                day = parts[1].padStart(2, '0');
            }
        }
        if (year && month && day) {
            return `${year}-${month}-${day}`;
        }
    }

    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
        const yyyy = parsed.getFullYear();
        const mm = String(parsed.getMonth() + 1).padStart(2, '0');
        const dd = String(parsed.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    return date;
}


// Certification Modal Form
function showCertificationModal() {
    const formHtml = `
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Certification Name <span class="text-rose-500">*</span></label>
            <input type="text" id="cert-name" required class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Organization / Issuer</label>
            <input type="text" id="cert-issuer" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Credential link <span class="text-xs font-normal text-slate-400">(optional)</span></label>
            <input type="url" id="cert-link" placeholder="https://example.com/verify" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Issue Date</label>
                <input type="date" id="cert-issue-date" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
                <input type="date" id="cert-expiry-date" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
            </div>
        </div>
    `;
    showModal('Add Certification', formHtml, async () => {
        const body = {
            name: document.getElementById('cert-name').value,
            issuer: document.getElementById('cert-issuer').value || null,
            credential_url: document.getElementById('cert-link').value || null,
            issue_date: formatDateForAPI(document.getElementById('cert-issue-date').value),
            expiry_date: formatDateForAPI(document.getElementById('cert-expiry-date').value)
        };
        await API.post('/students/me/certifications', body);
        showToast('Certification added successfully');
        renderProfile();
    });
}

// Delete Certification Confirmation
function deleteCertification(id, name) {
    showConfirmModal('Delete Certification', `Are you sure you want to delete the certification "${name}"?`, async () => {
        await API.delete(`/students/me/certifications/${id}`);
        showToast('Certification deleted');
        renderProfile();
    });
}

// Experience Modal Form (Supports Add & Edit)
function showExperienceModal(exp = null) {
    const isEdit = !!exp;
    const title = isEdit ? 'Edit Experience' : 'Add Experience';
    const formHtml = `
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Job Title <span class="text-rose-500">*</span></label>
            <input type="text" id="exp-title" required value="${exp ? escapeHtml(exp.title) : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Company Name <span class="text-rose-500">*</span></label>
            <input type="text" id="exp-company" required value="${exp ? escapeHtml(exp.company_name) : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Start Date <span class="text-rose-500">*</span></label>
                <input type="date" id="exp-start" required value="${exp ? exp.start_date : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
                <input type="date" id="exp-end" value="${exp && exp.end_date ? exp.end_date : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
            </div>
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea id="exp-desc" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm h-24 resize-none" placeholder="Briefly describe your role and key accomplishments...">${exp ? escapeHtml(exp.description || '') : ''}</textarea>
        </div>
    `;
    showModal(title, formHtml, async () => {
        const body = {
            title: document.getElementById('exp-title').value,
            company_name: document.getElementById('exp-company').value,
            start_date: formatDateForAPI(document.getElementById('exp-start').value),
            end_date: formatDateForAPI(document.getElementById('exp-end').value),
            description: document.getElementById('exp-desc').value || null
        };
        if (isEdit) {
            await API.put(`/students/me/experiences/${exp.id}`, body);
            showToast('Experience updated successfully');
        } else {
            await API.post('/students/me/experiences', body);
            showToast('Experience added successfully');
        }
        renderProfile();
    });
}

// Delete Experience Confirmation
function deleteExperience(id, company) {
    showConfirmModal('Delete Experience', `Are you sure you want to delete your experience at "${company}"?`, async () => {
        await API.delete(`/students/me/experiences/${id}`);
        showToast('Experience deleted');
        renderProfile();
    });
}

// Achievement Modal Form (Supports Add & Edit)
function showAchievementModal(ach = null) {
    const isEdit = !!ach;
    const title = isEdit ? 'Edit Achievement' : 'Add Achievement';
    const formHtml = `
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Title / Honor <span class="text-rose-500">*</span></label>
            <input type="text" id="ach-title" required value="${ach ? escapeHtml(ach.title) : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Date</label>
            <input type="date" id="ach-date" value="${ach && ach.date ? ach.date : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
        </div>
        <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea id="ach-desc" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm h-24 resize-none" placeholder="Provide extra details about this accomplishment...">${ach ? escapeHtml(ach.description || '') : ''}</textarea>
        </div>
    `;
    showModal(title, formHtml, async () => {
        const payload = {
            title: document.getElementById('ach-title').value,
            date: formatDateForAPI(document.getElementById('ach-date').value),
            description: document.getElementById('ach-desc').value || null
        };
        console.log('Sending achievement payload:', payload);
        if (isEdit) {
            await API.put(`/students/me/achievements/${ach.id}`, payload);
            showToast('Achievement updated successfully');
        } else {
            await API.post('/students/me/achievements', payload);
            showToast('Achievement added successfully');
        }
        renderProfile();
    });
}

// Delete Achievement Confirmation
function deleteAchievement(id, title) {
    showConfirmModal('Delete Achievement', `Are you sure you want to delete the achievement "${title}"?`, async () => {
        await API.delete(`/students/me/achievements/${id}`);
        showToast('Achievement deleted');
        renderProfile();
    });
}

// Global pagination state trackers
let jobsPage = 1;
let appsPage = 1;
let interviewsPage = 1;

// Helper to render pagination controls
function renderPaginationControls(total, page, pageSize, onPageChangeFnName) {
    const totalPages = Math.ceil(total / pageSize) || 1;
    if (totalPages <= 1) return '';
    
    return `
        <div class="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl mt-4">
            <div class="flex flex-1 justify-between sm:hidden">
                <button ${page <= 1 ? 'disabled' : ''} onclick="${onPageChangeFnName}(${page - 1})" class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                <button ${page >= totalPages ? 'disabled' : ''} onclick="${onPageChangeFnName}(${page + 1})" class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p class="text-sm text-slate-700">
                        Showing <span class="font-semibold">${total > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span class="font-semibold">${Math.min(page * pageSize, total)}</span> of <span class="font-semibold">${total}</span> results
                    </p>
                </div>
                <div>
                    <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button ${page <= 1 ? 'disabled' : ''} onclick="${onPageChangeFnName}(${page - 1})" class="relative inline-flex items-center rounded-l-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed">
                            <i class="bi bi-chevron-left text-xs"></i><span class="ml-1 text-xs font-semibold">Prev</span>
                        </button>
                        <span class="relative inline-flex items-center px-4 py-2 text-xs font-semibold text-[#092d52] ring-1 ring-inset ring-slate-300 bg-slate-50">
                            Page ${page} of ${totalPages}
                        </span>
                        <button ${page >= totalPages ? 'disabled' : ''} onclick="${onPageChangeFnName}(${page + 1})" class="relative inline-flex items-center rounded-r-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed">
                            <span class="mr-1 text-xs font-semibold">Next</span><i class="bi bi-chevron-right text-xs"></i>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    `;
}

// Render Jobs tab content (GET /api/v1/students/jobs)
async function renderJobs() {
    jobsPage = 1;
    const tabContent = document.getElementById('tab-content');
    tabContent.style.minHeight = '500px';
    tabContent.innerHTML = `
        <div class="tab-panel tab-content-section">
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex-1">
                <div class="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <i class="bi bi-funnel text-base text-[#092d52]"></i> Filter & Search Jobs
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                            <input id="job-query-title" placeholder="e.g. Software Engineer" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">Company</label>
                            <input id="job-query-company" placeholder="e.g. TechCorp" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                            <input id="job-query-location" placeholder="e.g. Lahore / Remote" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                            <select id="job-query-type" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none">
                                <option value="">All Types</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                        <button onclick="clearJobFilters()" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Reset</button>
                        <button onclick="searchJobs(1)" class="rounded-lg bg-[#092d52] border border-[#e47b0b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#061e38] transition-all flex items-center gap-1.5 shadow-sm">
                            <i class="bi bi-search"></i> Search Jobs
                        </button>
                    </div>
                </div>
                <div id="job-results" class="mt-4"></div>
            </section>
        </div>
    `;
    await searchJobs(1);
}

function clearJobFilters() {
    const t = document.getElementById('job-query-title'); if (t) t.value = '';
    const c = document.getElementById('job-query-company'); if (c) c.value = '';
    const l = document.getElementById('job-query-location'); if (l) l.value = '';
    const typ = document.getElementById('job-query-type'); if (typ) typ.value = '';
    searchJobs(1);
}

async function searchJobs(page = 1) {
    jobsPage = page;
    const resultsContainer = document.getElementById('job-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-4 border-[#092d52] border-t-[#e47b0b] rounded-full animate-spin"></div>
        </div>
    `;

    try {
        const title = document.getElementById('job-query-title')?.value || '';
        const company = document.getElementById('job-query-company')?.value || '';
        const location = document.getElementById('job-query-location')?.value || '';
        const type = document.getElementById('job-query-type')?.value || '';

        let queryParams = `page=${jobsPage}&page_size=${pageSize}`;
        if (title) queryParams += `&title=${encodeURIComponent(title)}`;
        if (company) queryParams += `&company_name=${encodeURIComponent(company)}`;
        if (location) queryParams += `&location=${encodeURIComponent(location)}`;
        if (type) queryParams += `&employment_type=${encodeURIComponent(type)}`;

        const data = await API.get(`/students/jobs?${queryParams}`);

        if (!data.items || data.items.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center py-12 text-slate-500 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                    <i class="bi bi-briefcase text-3xl text-slate-300"></i>
                    <p class="text-sm font-semibold mt-2">No matching jobs found</p>
                    <p class="text-xs text-slate-400 mt-1">Try resetting filters or searching with different keywords.</p>
                </div>
            `;
            return;
        }

        const cardsHtml = data.items.map(job => `
            <article class="mb-4 rounded-xl border border-slate-200 p-5 hover:border-[#092d52]/30 hover:shadow-md transition-all bg-white group">
                <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div class="space-y-2 flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <h2 class="font-bold text-[#092d52] text-lg hover:text-[#e47b0b] cursor-pointer transition-colors" onclick="viewJobDetail(${job.id})">${escapeHtml(job.title)}</h2>
                            <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">${escapeHtml(job.employment_type)}</span>
                        </div>
                        <p class="text-xs font-semibold text-[#e47b0b] flex items-center gap-3 flex-wrap">
                            <span><i class="bi bi-building mr-1"></i>${escapeHtml(job.company_name)}</span>
                            <span><i class="bi bi-geo-alt mr-1"></i>${escapeHtml(job.location || 'Remote')}</span>
                            ${job.salary_min || job.salary_max ? `<span><i class="bi bi-cash-stack mr-1"></i>PKR ${job.salary_min ? job.salary_min.toLocaleString() : 0} - ${job.salary_max ? job.salary_max.toLocaleString() : 'N/A'}</span>` : ''}
                            ${job.min_cgpa ? `<span><i class="bi bi-award mr-1"></i>Min CGPA: ${job.min_cgpa}</span>` : ''}
                        </p>
                        <p class="text-xs text-slate-600 leading-relaxed line-clamp-2 pt-1">${escapeHtml(job.description)}</p>
                        <div class="flex flex-wrap items-center gap-2 pt-1"><span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">${job.match_percentage}% profile match</span>${(job.skills || []).map(skill => `<span class="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">${escapeHtml(skill.skill_area)}: ${escapeHtml(skill.skill_name)}</span>`).join('')}</div>
                    </div>
                    <div class="flex sm:flex-col gap-2 self-start sm:self-center flex-shrink-0">
                        <button onclick="viewJobDetail(${job.id})" class="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors shadow-sm">Details</button>
                        ${job.is_applied ? `
                            <button disabled class="rounded-lg bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed px-4 py-2 text-xs font-semibold shadow-none"><i class="bi bi-check-circle-fill mr-1 text-emerald-600"></i>Applied</button>
                        ` : `
                            <button onclick="showApplyModal(${job.id}, '${escapeHtml(job.title).replace(/'/g, "\\'")}', '${escapeHtml(job.company_name).replace(/'/g, "\\'")}', false)" class="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-sm">Apply</button>
                        `}
                    </div>
                </div>
            </article>
        `).join('');

        const paginationHtml = renderPaginationControls(data.total, data.page, data.page_size, 'searchJobs');

        resultsContainer.innerHTML = `
            <div class="flex flex-col">
                ${cardsHtml}
                <div class="pagination-wrapper">
                    ${paginationHtml}
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Get Job Detail Modal (GET /api/v1/students/jobs/{job_id})
async function viewJobDetail(jobId) {
    try {
        const job = await API.get(`/students/jobs/${jobId}`);
        const modalContent = `
            <div class="space-y-4 text-left">
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <p class="text-xs font-bold text-[#e47b0b] uppercase tracking-wider">${escapeHtml(job.company_name || 'Company')}</p>
                    <h3 class="text-xl font-bold text-[#092d52] mt-0.5">${escapeHtml(job.title)}</h3>
                    
                    <div class="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                        <span class="bg-white border border-slate-200 px-2.5 py-1 rounded-md"><i class="bi bi-briefcase text-[#092d52] mr-1"></i>${escapeHtml(job.employment_type)}</span>
                        <span class="bg-white border border-slate-200 px-2.5 py-1 rounded-md"><i class="bi bi-geo-alt text-[#092d52] mr-1"></i>${escapeHtml(job.location || 'Remote')}</span>
                        ${job.min_cgpa ? `<span class="bg-white border border-slate-200 px-2.5 py-1 rounded-md"><i class="bi bi-mortarboard text-[#092d52] mr-1"></i>Min CGPA: ${job.min_cgpa}</span>` : ''}
                        ${job.application_deadline ? `<span class="bg-white border border-slate-200 px-2.5 py-1 rounded-md"><i class="bi bi-clock-history text-[#092d52] mr-1"></i>Deadline: ${formatDate(job.application_deadline)}</span>` : ''}
                    </div>
                </div>

                ${job.salary_min || job.salary_max ? `
                    <div class="text-xs text-slate-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-2">
                        <i class="bi bi-cash-stack text-emerald-600 text-lg"></i>
                        <span><strong>Salary Range:</strong> PKR ${job.salary_min ? job.salary_min.toLocaleString() : 0} - ${job.salary_max ? job.salary_max.toLocaleString() : 'N/A'}</span>
                    </div>
                ` : ''}

                <div>
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</h4>
                    <div class="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 max-h-48 overflow-y-auto whitespace-pre-wrap">${escapeHtml(job.description)}</div>
                </div>

                ${job.requirements ? `
                    <div>
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Requirements & Qualifications</h4>
                        <div class="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 max-h-48 overflow-y-auto whitespace-pre-wrap">${escapeHtml(job.requirements)}</div>
                    </div>
                ` : ''}
                <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><strong>${job.match_percentage}% profile match</strong> based on your saved skills and proficiency.</div>
            </div>
        `;

        showModal('Job Details', modalContent, async () => {
            showApplyModal(job.id, job.title, job.company_name, job.is_applied);
        });
        
        const submitBtn = document.querySelector('#custom-modal-form button[type="submit"]');
        if (submitBtn) {
            if (job.is_applied) {
                submitBtn.textContent = 'Already Applied';
                submitBtn.disabled = true;
                submitBtn.className = 'px-4 py-2 text-sm font-semibold text-slate-400 bg-slate-200 rounded-md cursor-not-allowed';
            } else {
                submitBtn.textContent = 'Apply For This Position';
                submitBtn.className = 'px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors';
            }
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Show Apply Modal (POST /api/v1/students/jobs/{job_id}/apply)
function showApplyModal(jobId, jobTitle, companyName, isApplied = false) {
    if (isApplied) {
        showToast('You have already applied for this position.', 'warning');
        return;
    }
    const formHtml = `
        <div class="space-y-3">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                <p class="font-bold">Applying for: ${escapeHtml(jobTitle)}</p>
                <p class="text-blue-700">${escapeHtml(companyName)}</p>
            </div>
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Cover Letter (Optional)</label>
                <textarea id="apply-cover-letter" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm h-32 resize-none" placeholder="Explain why you are a great fit for this position..."></textarea>
            </div>
            <p class="text-[11px] text-slate-500 italic"><i class="bi bi-info-circle mr-1"></i>Your current resume on profile will be attached automatically.</p>
        </div>
    `;

    showModal('Submit Application', formHtml, async () => {
        const coverLetter = document.getElementById('apply-cover-letter').value || null;
        await API.applyToJob(jobId, coverLetter);
        showToast('Application submitted successfully!');
        if (currentTab === 'applications') renderApplications();
        if (currentTab === 'jobs') searchJobs(jobsPage);
    });

    const submitBtn = document.querySelector('#custom-modal-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Submit Application';
        submitBtn.className = 'px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors';
    }
}

// Render Applications tab content (GET /api/v1/students/me/applications)
async function renderApplications() {
    appsPage = 1;
    const tabContent = document.getElementById('tab-content');
    tabContent.style.minHeight = '500px';
    tabContent.innerHTML = `
        <div class="tab-panel tab-content-section">
            <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex-1">
                <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <i class="bi bi-send text-base text-[#092d52]"></i> My Applications
                    </h3>
                    <div class="flex items-center gap-2">
                        <label class="text-xs font-semibold text-slate-600">Status Filter:</label>
                        <select id="apps-status-filter" onchange="filterApplications(1)" class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#e47b0b] outline-none">
                            <option value="">All Statuses</option>
                            <option value="applied">Applied</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                        </select>
                    </div>
                </div>
                <div id="applications-table-container"></div>
            </section>
        </div>
    `;
    await filterApplications(1);
}

async function filterApplications(page = 1) {
    appsPage = page;
    const container = document.getElementById('applications-table-container');
    if (!container) return;

    container.innerHTML = `
        <div class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-4 border-[#092d52] border-t-[#e47b0b] rounded-full animate-spin"></div>
        </div>
    `;

    try {
        const status = document.getElementById('apps-status-filter')?.value || '';
        let queryParams = `page=${appsPage}&page_size=${pageSize}`;
        if (status) queryParams += `&status=${encodeURIComponent(status)}`;

        const data = await API.get(`/students/me/applications?${queryParams}`);

        if (!data.items || data.items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                    <i class="bi bi-inbox text-3xl text-slate-300"></i>
                    <p class="text-sm font-medium mt-2">No applications found.</p>
                </div>
            `;
            return;
        }

        const tableHtml = `
            <div class="overflow-x-auto rounded-xl border border-slate-200">
                <table class="min-w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                        <tr>
                            <th class="px-6 py-3.5">Job Title</th>
                            <th class="px-6 py-3.5">Company</th>
                            <th class="px-6 py-3.5">Applied Date</th>
                            <th class="px-6 py-3.5">Status</th>
                            <th class="px-6 py-3.5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        ${data.items.map(item => `
                            <tr class="hover:bg-slate-50/70 transition-colors">
                                <td class="px-6 py-4 font-semibold text-[#092d52]">${escapeHtml(item.job_title)}</td>
                                <td class="px-6 py-4 font-medium text-slate-700">${escapeHtml(item.company_name)}</td>
                                <td class="px-6 py-4 text-xs text-slate-500 font-medium">${formatDate(item.applied_at)}</td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold 
                                        ${item.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                                          item.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                                          item.status === 'withdrawn' ? 'bg-slate-100 text-slate-700' :
                                          item.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                                          'bg-amber-100 text-amber-800'}">
                                        ${escapeHtml(item.status)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    ${['applied', 'shortlisted'].includes(item.status) ? `
                                        <button onclick="withdraw(${item.id})" class="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors bg-rose-50 px-3 py-1 rounded-md border border-rose-200">Withdraw</button>
                                    ` : '<span class="text-xs text-slate-400">-</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const paginationHtml = renderPaginationControls(data.total, data.page, data.page_size, 'filterApplications');
        container.innerHTML = `
            <div class="flex flex-col">
                ${tableHtml}
                <div class="pagination-wrapper">
                    ${paginationHtml}
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function withdraw(id) {
    showConfirmModal('Withdraw Application', 'Are you sure you want to withdraw this job application?', async () => {
        await API.post(`/students/me/applications/${id}/withdraw`);
        showToast('Application withdrawn');
        filterApplications(appsPage);
    });
}

// Render Interviews tab content (GET /api/v1/students/me/interview-requests)
async function renderInterviews() {
    interviewsPage = 1;
    const tabContent = document.getElementById('tab-content');
    tabContent.style.minHeight = '500px';
    tabContent.innerHTML = `
        <div class="tab-panel tab-content-section">
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex-1">
                <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <i class="bi bi-calendar-check text-base text-[#092d52]"></i> Interview Requests
                    </h3>
                    <div class="flex items-center gap-2">
                        <label class="text-xs font-semibold text-slate-600">Status Filter:</label>
                        <select id="interviews-status-filter" onchange="filterInterviews(1)" class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#e47b0b] outline-none">
                            <option value="">All Requests</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                        </select>
                    </div>
                </div>
                <div id="interviews-container"></div>
            </section>
        </div>
    `;
    await filterInterviews(1);
}

async function filterInterviews(page = 1) {
    interviewsPage = page;
    const container = document.getElementById('interviews-container');
    if (!container) return;

    container.innerHTML = `
        <div class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-4 border-[#092d52] border-t-[#e47b0b] rounded-full animate-spin"></div>
        </div>
    `;

    try {
        const status = document.getElementById('interviews-status-filter')?.value || '';
        let queryParams = `page=${interviewsPage}&page_size=${pageSize}`;
        if (status) queryParams += `&status=${encodeURIComponent(status)}`;

        const data = await API.get(`/students/me/interview-requests?${queryParams}`);

        if (!data.items || data.items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                    <i class="bi bi-calendar-x text-3xl text-slate-300"></i>
                    <p class="text-sm font-medium mt-2">No interview requests found.</p>
                </div>
            `;
            return;
        }

        const cardsHtml = data.items.map(item => `
            <article class="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div class="min-w-0 flex-1 space-y-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <h2 class="font-bold text-[#092d52] text-base sm:text-lg truncate">${escapeHtml(item.job_title)}</h2>
                            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold
                                ${item.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                                  item.status === 'declined' ? 'bg-rose-100 text-rose-800' :
                                  'bg-amber-100 text-amber-800'}">
                                ${escapeHtml(item.status)}
                            </span>
                        </div>
                        <p class="text-xs font-semibold text-[#e47b0b]">${escapeHtml(item.company_name)}</p>
                        ${item.interview_date ? `
                            <p class="text-xs text-slate-600 font-medium flex items-center gap-1">
                                <i class="bi bi-calendar-event text-[#092d52]"></i> Scheduled Date: ${formatDate(item.interview_date)}
                            </p>
                        ` : ''}
                        ${item.message ? `
                            <div class="mt-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                                <strong class="text-slate-900 block mb-1">Message from Employer:</strong>
                                ${escapeHtml(item.message)}
                            </div>
                        ` : ''}
                    </div>
                    
                    ${item.status === 'pending' ? `
                        <div class="flex sm:flex-col gap-2 self-start sm:self-center flex-shrink-0">
                            <button onclick="respond(${item.id}, 'accept')" class="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-sm">Accept</button>
                            <button onclick="respond(${item.id}, 'decline')" class="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors shadow-sm">Decline</button>
                        </div>
                    ` : ''}
                </div>
            </article>
        `).join('');

        const paginationHtml = renderPaginationControls(data.total, data.page, data.page_size, 'filterInterviews');
        container.innerHTML = `
            <div class="flex flex-col">
                ${cardsHtml}
                <div class="pagination-wrapper">
                    ${paginationHtml}
                </div>
            </div>
        `;
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function respond(id, action) {
    showConfirmModal(`${action === 'accept' ? 'Accept' : 'Decline'} Interview`, `Are you sure you want to ${action} this interview request?`, async () => {
        await API.respondInterviewRequest(id, action);
        showToast(`Interview request ${action}ed successfully`);
        filterInterviews(interviewsPage);
    });
}













// let currentPage = 1;
// let currentTab = 'profile';
// const pageSize = 10;

// function shell() {
//     if (!Auth.isAuthenticated()) { window.location.href = '/login.html'; return false; }
//     const user = Auth.getUser();
//     if (!user || user.role !== 'student') { window.location.href = '/index.html'; return false; }
    
//     const app = document.getElementById('app');
//     app.innerHTML = ''; // Clear out any previous content
//     app.appendChild(Navbar.render(user));
    
//     // Notifications bell render
//     const bell = document.getElementById('notification-bell');
//     if (bell) {
//         bell.innerHTML = NotificationBell.render();
//         updateUnreadCount();
//     }
    
//     const main = document.createElement('main');
//     main.className = 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8';
//     main.innerHTML = `
//         <!-- Dashboard Header Banner -->
//         <div class="mb-8 bg-gradient-to-r from-[#092d52] to-[#061e38] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border-b-4 border-[#e47b0b]">
//             <div class="absolute -right-10 -top-10 w-40 h-40 bg-[#e47b0b]/10 rounded-full pointer-events-none"></div>
//             <div class="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none"></div>
//             <div class="relative z-10">
//                 <p class="text-xs font-semibold uppercase tracking-widest text-[#e47b0b]">UET Career Portal</p>
//                 <h1 class="mt-2 text-3xl font-bold tracking-tight">Student Workspace</h1>
//                 <p class="mt-2 text-sm text-slate-300">Manage your professional profile, search jobs, and track applications.</p>
//             </div>
//         </div>
        
//         <!-- Navigation Tabs -->
//         <nav class="mb-6 flex gap-2 overflow-x-auto bg-white p-2 rounded-xl shadow-sm border border-slate-200">
//             <button data-tab="profile" onclick="switchTab('profile')" class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm bg-[#092d52] text-white border border-[#e47b0b] shadow-sm transition-all">Profile</button>
//             <button data-tab="jobs" onclick="switchTab('jobs')" class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-all">Jobs</button>
//             <button data-tab="applications" onclick="switchTab('applications')" class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-all">Applications</button>
//             <button data-tab="interviews" onclick="switchTab('interviews')" class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-all">Interviews</button>
//         </nav>
        
//         <div id="tab-content" class="transition-all duration-300"></div>
//     `;
//     app.appendChild(main);
//     return true;
// }

// document.addEventListener('DOMContentLoaded', async () => { if (shell()) await switchTab('profile'); });

// window.switchTab = async function (tab) {
//     currentTab = tab; currentPage = 1;
//     document.querySelectorAll('.tab-btn').forEach(button => {
//         const active = button.dataset.tab === tab;
//         if (active) {
//             button.className = "tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm bg-[#092d52] text-white border border-[#e47b0b] shadow-sm transition-all";
//         } else {
//             button.className = "tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-all";
//         }
//     });
    
//     // Set loader
//     document.getElementById('tab-content').innerHTML = `
//         <div class="flex flex-col items-center justify-center py-20 space-y-4">
//             <div class="w-10 h-10 border-4 border-[#092d52] border-t-[#e47b0b] rounded-full animate-spin"></div>
//             <p class="text-sm font-medium text-slate-500">Loading content...</p>
//         </div>
//     `;
    
//     try {
//         await ({ profile: renderProfile, jobs: renderJobs, applications: renderApplications, interviews: renderInterviews })[tab]();
//     } catch (err) {
//         document.getElementById('tab-content').innerHTML = `
//             <div class="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center max-w-lg mx-auto mt-10">
//                 <i class="bi bi-exclamation-octagon text-3xl text-rose-600"></i>
//                 <h4 class="mt-2 font-bold text-slate-900">Failed to Load Content</h4>
//                 <p class="mt-1 text-sm text-slate-600">${escapeHtml(err.message)}</p>
//                 <button onclick="switchTab('${tab}')" class="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#092d52] rounded-md hover:bg-[#061e38]">Retry</button>
//             </div>
//         `;
//     }
// };

// // HTML Escaper Helper
// function escapeHtml(str) {
//     if (!str) return '';
//     return String(str)
//         .replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&#039;');
// }

// // Reusable Dynamic Modal Dialog
// function showModal(title, formContent, onSubmit) {
//     closeModal();
//     const modalHtml = `
//         <div id="modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
//             <div class="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 animate-slide-up">
//                 <div class="bg-[#092d52] px-6 py-4 flex justify-between items-center text-white border-b-2 border-[#e47b0b]">
//                     <h3 class="text-base font-bold">${escapeHtml(title)}</h3>
//                     <button type="button" onclick="closeModal()" class="text-white hover:text-[#e47b0b] text-xl font-bold transition-colors">&times;</button>
//                 </div>
//                 <form id="custom-modal-form" class="p-6 space-y-4">
//                     ${formContent}
//                     <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
//                         <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">Cancel</button>
//                         <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-[#092d52] border border-[#e47b0b] rounded-md hover:bg-[#061e38] hover:border-[#c86600] transition-all">Submit</button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     `;
//     document.body.insertAdjacentHTML('beforeend', modalHtml);
//     document.getElementById('custom-modal-form').onsubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await onSubmit();
//             closeModal();
//         } catch (err) {
//             showToast(err.message, 'error');
//         }
//     };
// }

// // Reusable Confirmation Dialog
// function showConfirmModal(title, message, onConfirm) {
//     closeModal();
//     const modalHtml = `
//         <div id="modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
//             <div class="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 p-6 space-y-4">
//                 <div class="flex items-center gap-3 text-amber-600">
//                     <i class="bi bi-exclamation-triangle-fill text-2xl"></i>
//                     <h3 class="text-lg font-bold text-slate-950">${escapeHtml(title)}</h3>
//                 </div>
//                 <p class="text-sm text-slate-600">${escapeHtml(message)}</p>
//                 <div class="flex justify-end gap-3 pt-2">
//                     <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">Cancel</button>
//                     <button type="button" id="confirm-delete-btn" class="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors">Confirm</button>
//                 </div>
//             </div>
//         </div>
//     `;
//     document.body.insertAdjacentHTML('beforeend', modalHtml);
//     document.getElementById('confirm-delete-btn').onclick = async () => {
//         try {
//             await onConfirm();
//             closeModal();
//         } catch (err) {
//             showToast(err.message, 'error');
//         }
//     };
// }

// async function renderProfile() {
//     try {
//         const [profile, skills, experiences, certifications, softSkills, achievements] = await Promise.all([
//             API.get('/students/me'),
//             API.get('/students/me/skills'),
//             API.get('/students/me/experiences'),
//             API.get('/students/me/certifications'),
//             API.get('/students/me/soft-skills'),
//             API.get('/students/me/achievements')
//         ]);
        
//         document.getElementById('tab-content').innerHTML = `
//             <div class="grid gap-6 lg:grid-cols-3">
//                 <!-- Main Content Panel -->
//                 <div class="lg:col-span-2 space-y-6">
                    
//                     <!-- Profile Card -->
//                     <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//                         <div class="h-2 bg-gradient-to-r from-[#092d52] via-[#e47b0b] to-[#092d52]"></div>
//                         <div class="p-6 md:p-8">
//                             <div class="flex flex-col sm:flex-row items-center gap-6">
//                                 <!-- Photo Container -->
//                                 <div class="relative group w-28 h-28 flex-shrink-0">
//                                     ${profile.photo_path ? `
//                                         <img src="${CONFIG.API_BASE_URL.replace('/api/v1', '')}${profile.photo_path}" alt="${escapeHtml(profile.name)}" class="w-full h-full rounded-full object-cover border-4 border-[#e47b0b] shadow-md">
//                                         <div class="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2.5 transition-all duration-200">
//                                             <button onclick="uploadFile('photo')" class="text-white hover:text-[#e47b0b] transition-colors" title="Change Photo"><i class="bi bi-camera-fill text-lg"></i></button>
//                                             <button onclick="deletePhoto()" class="text-white hover:text-rose-500 transition-colors" title="Delete Photo"><i class="bi bi-trash-fill text-lg"></i></button>
//                                         </div>
//                                     ` : `
//                                         <div class="w-full h-full rounded-full bg-[#092d52] border-4 border-[#e47b0b] shadow-md flex items-center justify-center text-white text-3xl font-bold uppercase">
//                                             ${profile.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'UET'}
//                                         </div>
//                                         <div class="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
//                                             <button onclick="uploadFile('photo')" class="text-white hover:text-[#e47b0b] transition-colors" title="Upload Photo"><i class="bi bi-camera-fill text-xl"></i></button>
//                                         </div>
//                                     `}
//                                 </div>
                                
//                                 <!-- Student Info -->
//                                 <div class="text-center sm:text-left flex-1 min-w-0">
//                                     <h2 class="text-2xl font-bold text-slate-900 tracking-tight">${escapeHtml(profile.name)}</h2>
//                                     <p class="text-sm font-semibold text-[#e47b0b] mt-0.5">${escapeHtml(profile.department)}</p>
//                                     <div class="mt-2.5 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
//                                         <span><i class="bi bi-hash mr-1"></i>${escapeHtml(profile.roll_no)}</span>
//                                         <span class="hidden sm:inline text-slate-300">|</span>
//                                         <span><i class="bi bi-journal-bookmark mr-1"></i>Semester ${escapeHtml(profile.semester)}</span>
//                                         <span class="hidden sm:inline text-slate-300">|</span>
//                                         <span><i class="bi bi-envelope mr-1"></i>${escapeHtml(profile.email)}</span>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <!-- Professional Bio -->
//                             <div class="mt-8 pt-6 border-t border-slate-100">
//                                 <div class="flex justify-between items-center mb-2">
//                                     <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Professional Bio</h3>
//                                     <button onclick="editBio(${JSON.stringify(profile.bio || '')})" class="text-xs font-bold text-[#092d52] hover:text-[#e47b0b] flex items-center gap-1 transition-colors">
//                                         <i class="bi bi-pencil-square"></i> Edit
//                                     </button>
//                                 </div>
//                                 <p class="text-slate-700 text-sm leading-relaxed">${escapeHtml(profile.bio || 'No professional bio added yet. Click Edit to add one and showcase your career goals.')}</p>
//                             </div>
//                         </div>
//                     </section>
                    
//                     <!-- Resume Card -->
//                     <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
//                         <h3 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
//                             <i class="bi bi-file-earmark-text text-xl text-[#092d52]"></i> Resume / CV
//                         </h3>
//                         ${profile.resume_path ? `
//                             <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
//                                 <div class="flex items-center gap-3">
//                                     <div class="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
//                                         <i class="bi bi-file-earmark-pdf-fill text-2xl"></i>
//                                     </div>
//                                     <div class="min-w-0">
//                                         <p class="text-sm font-semibold text-slate-800 truncate">Resume_${escapeHtml(profile.name.replace(/\s+/g, '_'))}.pdf</p>
//                                         <a href="${CONFIG.API_BASE_URL.replace('/api/v1', '')}${profile.resume_path}" target="_blank" class="text-xs font-bold text-[#092d52] hover:text-[#e47b0b] inline-flex items-center gap-1 mt-0.5 transition-colors">
//                                             <i class="bi bi-eye"></i> View PDF
//                                         </a>
//                                     </div>
//                                 </div>
//                                 <div class="flex gap-2">
//                                     <button onclick="uploadFile('resume')" class="p-2 text-slate-500 hover:text-[#092d52] rounded-lg hover:bg-slate-100 transition-all" title="Re-upload Resume">
//                                         <i class="bi bi-arrow-repeat text-lg"></i>
//                                     </button>
//                                     <button onclick="deleteResume()" class="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all" title="Delete Resume">
//                                         <i class="bi bi-trash-fill text-lg"></i>
//                                     </button>
//                                 </div>
//                             </div>
//                         ` : `
//                             <div class="text-center py-6 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
//                                 <i class="bi bi-cloud-arrow-up text-3xl text-slate-400"></i>
//                                 <h4 class="mt-2 text-sm font-bold text-slate-800">No Resume Uploaded</h4>
//                                 <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Upload your resume (PDF/DOC/DOCX) to apply for job postings and stand out to employers.</p>
//                                 <button onclick="uploadFile('resume')" class="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#092d52] rounded-md hover:bg-[#061e38] transition-colors shadow-sm">
//                                     Upload Resume
//                                 </button>
//                             </div>
//                         `}
//                     </section>
                    
//                     <!-- Experiences Card -->
//                     <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
//                         <div class="flex justify-between items-center mb-6">
//                             <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
//                                 <i class="bi bi-briefcase text-xl text-[#092d52]"></i> Work Experience
//                             </h3>
//                             <button onclick="showExperienceModal()" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#092d52] border border-[#e47b0b] rounded-lg hover:bg-[#061e38] transition-all flex items-center gap-1 shadow-sm">
//                                 <i class="bi bi-plus-lg"></i> Add
//                             </button>
//                         </div>
//                         <div class="space-y-4">
//                             ${experiences.length > 0 ? experiences.map(exp => `
//                                 <div class="relative p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-all group">
//                                     <div class="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                         <button onclick="showExperienceModal(${JSON.stringify(exp).replace(/"/g, '&quot;')})" class="p-1 text-slate-400 hover:text-[#092d52] rounded hover:bg-slate-100 transition-all" title="Edit">
//                                             <i class="bi bi-pencil-fill text-xs"></i>
//                                         </button>
//                                         <button onclick="deleteExperience(${exp.id}, '${exp.company_name}')" class="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-all" title="Delete">
//                                             <i class="bi bi-trash-fill text-xs"></i>
//                                         </button>
//                                     </div>
                                    
//                                     <h4 class="font-bold text-slate-900 pr-16 text-sm sm:text-base">${escapeHtml(exp.title)}</h4>
//                                     <p class="text-sm font-semibold text-[#e47b0b] mt-0.5">${escapeHtml(exp.company_name)}</p>
//                                     <p class="text-xs text-slate-500 font-medium mt-1">
//                                         <i class="bi bi-calendar-event mr-1"></i>
//                                         ${formatDate(exp.start_date)} - ${exp.end_date ? formatDate(exp.end_date) : '<span class="text-emerald-600 font-bold">Present</span>'}
//                                     </p>
//                                     ${exp.description ? `
//                                         <p class="text-xs text-slate-600 mt-2.5 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-100/50">${escapeHtml(exp.description)}</p>
//                                     ` : ''}
//                                 </div>
//                             `).join('') : `
//                                 <div class="text-center py-8 text-slate-500 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
//                                     <i class="bi bi-briefcase text-2xl text-slate-300"></i>
//                                     <p class="text-sm mt-1.5 font-medium">No experience added yet.</p>
//                                 </div>
//                             `}
//                         </div>
//                     </section>
                    
//                     <!-- Achievements Card -->
//                     <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
//                         <div class="flex justify-between items-center mb-6">
//                             <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
//                                 <i class="bi bi-trophy text-xl text-[#092d52]"></i> Achievements & Awards
//                             </h3>
//                             <button onclick="showAchievementModal()" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#092d52] border border-[#e47b0b] rounded-lg hover:bg-[#061e38] transition-all flex items-center gap-1 shadow-sm">
//                                 <i class="bi bi-plus-lg"></i> Add
//                             </button>
//                         </div>
//                         <div class="space-y-4">
//                             ${achievements.length > 0 ? achievements.map(ach => `
//                                 <div class="relative p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-all group">
//                                     <div class="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                         <button onclick="showAchievementModal(${JSON.stringify(ach).replace(/"/g, '&quot;')})" class="p-1 text-slate-400 hover:text-[#092d52] rounded hover:bg-slate-100 transition-all" title="Edit">
//                                             <i class="bi bi-pencil-fill text-xs"></i>
//                                         </button>
//                                         <button onclick="deleteAchievement(${ach.id}, '${ach.title}')" class="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-all" title="Delete">
//                                             <i class="bi bi-trash-fill text-xs"></i>
//                                         </button>
//                                     </div>
                                    
//                                     <h4 class="font-bold text-slate-900 pr-16 text-sm sm:text-base">${escapeHtml(ach.title)}</h4>
//                                     ${ach.date ? `
//                                         <p class="text-xs text-slate-500 font-medium mt-1">
//                                             <i class="bi bi-calendar-event mr-1"></i>
//                                             ${formatDate(ach.date)}
//                                         </p>
//                                     ` : ''}
//                                     ${ach.description ? `
//                                         <p class="text-xs text-slate-600 mt-2.5 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-100/50">${escapeHtml(ach.description)}</p>
//                                     ` : ''}
//                                 </div>
//                             `).join('') : `
//                                 <div class="text-center py-8 text-slate-500 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
//                                     <i class="bi bi-trophy text-2xl text-slate-300"></i>
//                                     <p class="text-sm mt-1.5 font-medium">No achievements added yet.</p>
//                                 </div>
//                             `}
//                         </div>
//                     </section>
//                 </div>
                
//                 <!-- Sidebar -->
//                 <div class="space-y-6">
                    
//                     <!-- Technical Skills -->
//                     <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
//                         <div class="flex justify-between items-center mb-4">
//                             <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
//                                 <i class="bi bi-code-slash text-base text-[#092d52]"></i> Technical Skills
//                             </h3>
//                             <button onclick="showSkillModal()" class="text-xs font-bold text-[#092d52] hover:text-[#e47b0b] flex items-center gap-0.5 transition-colors">
//                                 <i class="bi bi-plus-lg"></i> Add
//                             </button>
//                         </div>
//                         <div class="flex flex-wrap gap-2">
//                             ${skills.length > 0 ? skills.map(item => `
//                                 <span class="inline-flex items-center gap-1 rounded-full bg-[#092d52]/5 border border-[#092d52]/10 px-2.5 py-1 text-xs font-semibold text-[#092d52]">
//                                     <span>${escapeHtml(item.skill_name)}</span>
//                                     ${item.proficiency ? `<span class="text-[9px] text-slate-400 font-normal">(${escapeHtml(item.proficiency)})</span>` : ''}
//                                     <button onclick="deleteSkill(${item.id}, '${item.skill_name}')" class="text-slate-400 hover:text-rose-600 transition-colors ml-1" title="Delete">
//                                         <i class="bi bi-x text-sm"></i>
//                                     </button>
//                                 </span>
//                             `).join('') : `
//                                 <p class="text-xs text-slate-400">No technical skills added yet.</p>
//                             `}
//                         </div>
//                     </section>
                    
//                     <!-- Soft Skills -->
//                     <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
//                         <div class="flex justify-between items-center mb-4">
//                             <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
//                                 <i class="bi bi-people text-base text-[#092d52]"></i> Soft Skills
//                             </h3>
//                             <button onclick="showSoftSkillModal()" class="text-xs font-bold text-[#092d52] hover:text-[#e47b0b] flex items-center gap-0.5 transition-colors">
//                                 <i class="bi bi-plus-lg"></i> Add
//                             </button>
//                         </div>
//                         <div class="flex flex-wrap gap-2">
//                             ${softSkills.length > 0 ? softSkills.map(item => `
//                                 <span class="inline-flex items-center gap-1 rounded-full bg-[#e47b0b]/5 border border-[#e47b0b]/15 px-2.5 py-1 text-xs font-semibold text-[#e47b0b]">
//                                     <span>${escapeHtml(item.skill_name)}</span>
//                                     <button onclick="deleteSoftSkill(${item.id}, '${item.skill_name}')" class="text-slate-400 hover:text-rose-600 transition-colors ml-1" title="Delete">
//                                         <i class="bi bi-x text-sm"></i>
//                                     </button>
//                                 </span>
//                             `).join('') : `
//                                 <p class="text-xs text-slate-400">No soft skills added yet.</p>
//                             `}
//                         </div>
//                     </section>
                    
//                     <!-- Certifications -->
//                     <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
//                         <div class="flex justify-between items-center mb-4">
//                             <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
//                                 <i class="bi bi-patch-check text-base text-[#092d52]"></i> Certifications
//                             </h3>
//                             <button onclick="showCertificationModal()" class="text-xs font-bold text-[#092d52] hover:text-[#e47b0b] flex items-center gap-0.5 transition-colors">
//                                 <i class="bi bi-plus-lg"></i> Add
//                             </button>
//                         </div>
//                         <div class="space-y-3">
//                             ${certifications.length > 0 ? certifications.map(cert => `
//                                 <div class="relative group p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
//                                     <div class="flex justify-between items-start">
//                                         <div class="min-w-0 pr-6">
//                                             <h4 class="font-bold text-slate-800 text-sm truncate">${escapeHtml(cert.name)}</h4>
//                                             ${cert.issuer ? `<p class="text-xs text-[#e47b0b] font-semibold mt-0.5 truncate">${escapeHtml(cert.issuer)}</p>` : ''}
//                                             ${cert.issue_date ? `
//                                                 <p class="text-[10px] text-slate-400 mt-1 font-medium">
//                                                     <i class="bi bi-calendar3 mr-1"></i>
//                                                     ${formatDate(cert.issue_date)}${cert.expiry_date ? ` - ${formatDate(cert.expiry_date)}` : ''}
//                                                 </p>
//                                             ` : ''}
//                                         </div>
//                                         <button onclick="deleteCertification(${cert.id}, '${cert.name}')" class="absolute right-3 top-3.5 text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
//                                             <i class="bi bi-trash-fill text-xs"></i>
//                                         </button>
//                                     </div>
//                                 </div>
//                             `).join('') : `
//                                 <p class="text-xs text-slate-400">No certifications added yet.</p>
//                             `}
//                         </div>
//                     </section>
//                 </div>
//             </div>
//         `;
//     } catch (error) {
//         showToast(error.message, 'error');
//     }
// }

// // Edit Bio Modal Form
// function editBio(bio) {
//     const formHtml = `
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
//             <textarea id="profile-bio-input" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm h-32 resize-none" placeholder="Write a short professional bio...">${escapeHtml(bio || '')}</textarea>
//         </div>
//     `;
//     showModal('Edit Bio', formHtml, async () => {
//         const val = document.getElementById('profile-bio-input').value;
//         await API.put('/students/me', { bio: val });
//         showToast('Bio updated successfully');
//         renderProfile();
//     });
// }

// // Dynamic photo/resume file uploader
// function uploadFile(type) {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = type === 'resume' ? '.pdf,.doc,.docx' : '.jpg,.jpeg,.png';
//     input.onchange = async () => {
//         if (!input.files[0]) return;
//         const data = new FormData();
//         data.append('file', input.files[0]);
        
//         const loadingToast = document.createElement('div');
//         loadingToast.className = "fixed bottom-4 right-4 z-50 rounded-md px-5 py-3 text-white bg-blue-700 shadow-lg flex items-center gap-2";
//         loadingToast.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Uploading ${type}...`;
//         document.body.appendChild(loadingToast);
        
//         try {
//             await API.upload(`/students/me/${type}`, data);
//             loadingToast.remove();
//             showToast(`${type} uploaded successfully`);
//             renderProfile();
//         } catch (error) {
//             loadingToast.remove();
//             showToast(error.message, 'error');
//         }
//     };
//     input.click();
// }

// // Delete Profile Picture Confirmation
// function deletePhoto() {
//     showConfirmModal('Delete Profile Picture', 'Are you sure you want to delete your profile picture?', async () => {
//         await API.delete('/students/me/photo');
//         showToast('Profile picture deleted');
//         renderProfile();
//     });
// }

// // Delete Resume Confirmation
// function deleteResume() {
//     showConfirmModal('Delete Resume', 'Are you sure you want to delete your resume?', async () => {
//         await API.delete('/students/me/resume');
//         showToast('Resume deleted');
//         renderProfile();
//     });
// }

// // Skill Modal Form
// function showSkillModal() {
//     const formHtml = `
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Skill Name <span class="text-rose-500">*</span></label>
//             <input type="text" id="skill-name" required class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//         </div>
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Proficiency</label>
//             <select id="skill-proficiency" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//                 <option value="">Select proficiency</option>
//                 <option value="Beginner">Beginner</option>
//                 <option value="Intermediate">Intermediate</option>
//                 <option value="Expert">Expert</option>
//             </select>
//         </div>
//     `;
//     showModal('Add Skill', formHtml, async () => {
//         const body = {
//             skill_name: document.getElementById('skill-name').value,
//             proficiency: document.getElementById('skill-proficiency').value || null
//         };
//         await API.post('/students/me/skills', body);
//         showToast('Skill added successfully');
//         renderProfile();
//     });
// }

// // Delete Skill Confirmation
// function deleteSkill(id, name) {
//     showConfirmModal('Delete Skill', `Are you sure you want to delete the skill "${name}"?`, async () => {
//         await API.delete(`/students/me/skills/${id}`);
//         showToast('Skill deleted');
//         renderProfile();
//     });
// }

// // Soft Skill Modal Form
// function showSoftSkillModal() {
//     const formHtml = `
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Soft Skill Name <span class="text-rose-500">*</span></label>
//             <input type="text" id="soft-skill-name" required class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//         </div>
//     `;
//     showModal('Add Soft Skill', formHtml, async () => {
//         const body = {
//             skill_name: document.getElementById('soft-skill-name').value
//         };
//         await API.post('/students/me/soft-skills', body);
//         showToast('Soft skill added successfully');
//         renderProfile();
//     });
// }

// // Delete Soft Skill Confirmation
// function deleteSoftSkill(id, name) {
//     showConfirmModal('Delete Soft Skill', `Are you sure you want to delete the soft skill "${name}"?`, async () => {
//         await API.delete(`/students/me/soft-skills/${id}`);
//         showToast('Soft skill deleted');
//         renderProfile();
//     });
// }

// // Date formatting helper for API payloads
// function formatDateForAPI(date) {
//     if (!date) return null;
//     if (typeof date !== 'string') return null;
//     date = date.trim();
//     if (!date) return null;

//     if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

//     const parts = date.split(/[\/\.-]/);
//     if (parts.length === 3) {
//         let year, month, day;
//         if (parts[0].length === 4) {
//             year = parts[0];
//             month = parts[1].padStart(2, '0');
//             day = parts[2].padStart(2, '0');
//         } else if (parts[2].length === 4) {
//             year = parts[2];
//             let p0 = parseInt(parts[0], 10);
//             let p1 = parseInt(parts[1], 10);
//             if (p0 > 12 && p1 <= 12) {
//                 day = parts[0].padStart(2, '0');
//                 month = parts[1].padStart(2, '0');
//             } else {
//                 month = parts[0].padStart(2, '0');
//                 day = parts[1].padStart(2, '0');
//             }
//         }
//         if (year && month && day) {
//             return `${year}-${month}-${day}`;
//         }
//     }

//     const parsed = new Date(date);
//     if (!isNaN(parsed.getTime())) {
//         const yyyy = parsed.getFullYear();
//         const mm = String(parsed.getMonth() + 1).padStart(2, '0');
//         const dd = String(parsed.getDate()).padStart(2, '0');
//         return `${yyyy}-${mm}-${dd}`;
//     }

//     return date;
// }


// // Certification Modal Form
// function showCertificationModal() {
//     const formHtml = `
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Certification Name <span class="text-rose-500">*</span></label>
//             <input type="text" id="cert-name" required class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//         </div>
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Issuer</label>
//             <input type="text" id="cert-issuer" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//         </div>
//         <div class="grid grid-cols-2 gap-4">
//             <div>
//                 <label class="block text-sm font-semibold text-slate-700 mb-1">Issue Date</label>
//                 <input type="date" id="cert-issue-date" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//             </div>
//             <div>
//                 <label class="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
//                 <input type="date" id="cert-expiry-date" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//             </div>
//         </div>
//     `;
//     showModal('Add Certification', formHtml, async () => {
//         const body = {
//             name: document.getElementById('cert-name').value,
//             issuer: document.getElementById('cert-issuer').value || null,
//             issue_date: formatDateForAPI(document.getElementById('cert-issue-date').value),
//             expiry_date: formatDateForAPI(document.getElementById('cert-expiry-date').value)
//         };
//         await API.post('/students/me/certifications', body);
//         showToast('Certification added successfully');
//         renderProfile();
//     });
// }

// // Delete Certification Confirmation
// function deleteCertification(id, name) {
//     showConfirmModal('Delete Certification', `Are you sure you want to delete the certification "${name}"?`, async () => {
//         await API.delete(`/students/me/certifications/${id}`);
//         showToast('Certification deleted');
//         renderProfile();
//     });
// }

// // Experience Modal Form (Supports Add & Edit)
// function showExperienceModal(exp = null) {
//     const isEdit = !!exp;
//     const title = isEdit ? 'Edit Experience' : 'Add Experience';
//     const formHtml = `
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Job Title <span class="text-rose-500">*</span></label>
//             <input type="text" id="exp-title" required value="${exp ? escapeHtml(exp.title) : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//         </div>
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Company Name <span class="text-rose-500">*</span></label>
//             <input type="text" id="exp-company" required value="${exp ? escapeHtml(exp.company_name) : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//         </div>
//         <div class="grid grid-cols-2 gap-4">
//             <div>
//                 <label class="block text-sm font-semibold text-slate-700 mb-1">Start Date <span class="text-rose-500">*</span></label>
//                 <input type="date" id="exp-start" required value="${exp ? exp.start_date : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//             </div>
//             <div>
//                 <label class="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
//                 <input type="date" id="exp-end" value="${exp && exp.end_date ? exp.end_date : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//             </div>
//         </div>
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Description</label>
//             <textarea id="exp-desc" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm h-24 resize-none" placeholder="Briefly describe your role and key accomplishments...">${exp ? escapeHtml(exp.description || '') : ''}</textarea>
//         </div>
//     `;
//     showModal(title, formHtml, async () => {
//         const body = {
//             title: document.getElementById('exp-title').value,
//             company_name: document.getElementById('exp-company').value,
//             start_date: formatDateForAPI(document.getElementById('exp-start').value),
//             end_date: formatDateForAPI(document.getElementById('exp-end').value),
//             description: document.getElementById('exp-desc').value || null
//         };
//         if (isEdit) {
//             await API.put(`/students/me/experiences/${exp.id}`, body);
//             showToast('Experience updated successfully');
//         } else {
//             await API.post('/students/me/experiences', body);
//             showToast('Experience added successfully');
//         }
//         renderProfile();
//     });
// }

// // Delete Experience Confirmation
// function deleteExperience(id, company) {
//     showConfirmModal('Delete Experience', `Are you sure you want to delete your experience at "${company}"?`, async () => {
//         await API.delete(`/students/me/experiences/${id}`);
//         showToast('Experience deleted');
//         renderProfile();
//     });
// }

// // Achievement Modal Form (Supports Add & Edit)
// function showAchievementModal(ach = null) {
//     const isEdit = !!ach;
//     const title = isEdit ? 'Edit Achievement' : 'Add Achievement';
//     const formHtml = `
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Title / Honor <span class="text-rose-500">*</span></label>
//             <input type="text" id="ach-title" required value="${ach ? escapeHtml(ach.title) : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//         </div>
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Date</label>
//             <input type="date" id="ach-date" value="${ach && ach.date ? ach.date : ''}" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm">
//         </div>
//         <div>
//             <label class="block text-sm font-semibold text-slate-700 mb-1">Description</label>
//             <textarea id="ach-desc" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm h-24 resize-none" placeholder="Provide extra details about this accomplishment...">${ach ? escapeHtml(ach.description || '') : ''}</textarea>
//         </div>
//     `;
//     showModal(title, formHtml, async () => {
//         const payload = {
//             title: document.getElementById('ach-title').value,
//             date: formatDateForAPI(document.getElementById('ach-date').value),
//             description: document.getElementById('ach-desc').value || null
//         };
//         console.log('Sending achievement payload:', payload);
//         if (isEdit) {
//             await API.put(`/students/me/achievements/${ach.id}`, payload);
//             showToast('Achievement updated successfully');
//         } else {
//             await API.post('/students/me/achievements', payload);
//             showToast('Achievement added successfully');
//         }
//         renderProfile();
//     });
// }

// // Delete Achievement Confirmation
// function deleteAchievement(id, title) {
//     showConfirmModal('Delete Achievement', `Are you sure you want to delete the achievement "${title}"?`, async () => {
//         await API.delete(`/students/me/achievements/${id}`);
//         showToast('Achievement deleted');
//         renderProfile();
//     });
// }

// // Global pagination state trackers
// let jobsPage = 1;
// let appsPage = 1;
// let interviewsPage = 1;

// // Helper to render pagination controls
// function renderPaginationControls(total, page, pageSize, onPageChangeFnName) {
//     const totalPages = Math.ceil(total / pageSize) || 1;
//     if (totalPages <= 1) return '';
    
//     return `
//         <div class="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl mt-4">
//             <div class="flex flex-1 justify-between sm:hidden">
//                 <button ${page <= 1 ? 'disabled' : ''} onclick="${onPageChangeFnName}(${page - 1})" class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
//                 <button ${page >= totalPages ? 'disabled' : ''} onclick="${onPageChangeFnName}(${page + 1})" class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
//             </div>
//             <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
//                 <div>
//                     <p class="text-sm text-slate-700">
//                         Showing <span class="font-semibold">${total > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span class="font-semibold">${Math.min(page * pageSize, total)}</span> of <span class="font-semibold">${total}</span> results
//                     </p>
//                 </div>
//                 <div>
//                     <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
//                         <button ${page <= 1 ? 'disabled' : ''} onclick="${onPageChangeFnName}(${page - 1})" class="relative inline-flex items-center rounded-l-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed">
//                             <i class="bi bi-chevron-left text-xs"></i><span class="ml-1 text-xs font-semibold">Prev</span>
//                         </button>
//                         <span class="relative inline-flex items-center px-4 py-2 text-xs font-semibold text-[#092d52] ring-1 ring-inset ring-slate-300 bg-slate-50">
//                             Page ${page} of ${totalPages}
//                         </span>
//                         <button ${page >= totalPages ? 'disabled' : ''} onclick="${onPageChangeFnName}(${page + 1})" class="relative inline-flex items-center rounded-r-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed">
//                             <span class="mr-1 text-xs font-semibold">Next</span><i class="bi bi-chevron-right text-xs"></i>
//                         </button>
//                     </nav>
//                 </div>
//             </div>
//         </div>
//     `;
// }

// // Render Jobs tab content (GET /api/v1/students/jobs)
// async function renderJobs() {
//     jobsPage = 1;
//     document.getElementById('tab-content').innerHTML = `
//         <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//             <div class="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
//                 <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
//                     <i class="bi bi-funnel text-base text-[#092d52]"></i> Filter & Search Jobs
//                 </h3>
//                 <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//                     <div>
//                         <label class="block text-xs font-semibold text-slate-600 mb-1">Title</label>
//                         <input id="job-query-title" placeholder="e.g. Software Engineer" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none">
//                     </div>
//                     <div>
//                         <label class="block text-xs font-semibold text-slate-600 mb-1">Company</label>
//                         <input id="job-query-company" placeholder="e.g. TechCorp" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none">
//                     </div>
//                     <div>
//                         <label class="block text-xs font-semibold text-slate-600 mb-1">Location</label>
//                         <input id="job-query-location" placeholder="e.g. Lahore / Remote" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none">
//                     </div>
//                     <div>
//                         <label class="block text-xs font-semibold text-slate-600 mb-1">Type</label>
//                         <select id="job-query-type" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none">
//                             <option value="">All Types</option>
//                             <option value="Full-time">Full-time</option>
//                             <option value="Part-time">Part-time</option>
//                             <option value="Internship">Internship</option>
//                             <option value="Contract">Contract</option>
//                         </select>
//                     </div>
//                 </div>
//                 <div class="flex justify-end gap-2 pt-2">
//                     <button onclick="clearJobFilters()" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Reset</button>
//                     <button onclick="searchJobs(1)" class="rounded-lg bg-[#092d52] border border-[#e47b0b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#061e38] transition-all flex items-center gap-1.5 shadow-sm">
//                         <i class="bi bi-search"></i> Search Jobs
//                     </button>
//                 </div>
//             </div>
//             <div id="job-results" class="mt-4"></div>
//         </section>
//     `;
//     await searchJobs(1);
// }

// function clearJobFilters() {
//     const t = document.getElementById('job-query-title'); if (t) t.value = '';
//     const c = document.getElementById('job-query-company'); if (c) c.value = '';
//     const l = document.getElementById('job-query-location'); if (l) l.value = '';
//     const typ = document.getElementById('job-query-type'); if (typ) typ.value = '';
//     searchJobs(1);
// }

// async function searchJobs(page = 1) {
//     jobsPage = page;
//     const resultsContainer = document.getElementById('job-results');
//     if (!resultsContainer) return;
    
//     resultsContainer.innerHTML = `
//         <div class="flex items-center justify-center py-12">
//             <div class="w-8 h-8 border-4 border-[#092d52] border-t-[#e47b0b] rounded-full animate-spin"></div>
//         </div>
//     `;

//     try {
//         const title = document.getElementById('job-query-title')?.value || '';
//         const company = document.getElementById('job-query-company')?.value || '';
//         const location = document.getElementById('job-query-location')?.value || '';
//         const type = document.getElementById('job-query-type')?.value || '';

//         let queryParams = `page=${jobsPage}&page_size=${pageSize}`;
//         if (title) queryParams += `&title=${encodeURIComponent(title)}`;
//         if (company) queryParams += `&company_name=${encodeURIComponent(company)}`;
//         if (location) queryParams += `&location=${encodeURIComponent(location)}`;
//         if (type) queryParams += `&employment_type=${encodeURIComponent(type)}`;

//         const data = await API.get(`/students/jobs?${queryParams}`);

//         if (!data.items || data.items.length === 0) {
//             resultsContainer.innerHTML = `
//                 <div class="text-center py-12 text-slate-500 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
//                     <i class="bi bi-briefcase text-3xl text-slate-300"></i>
//                     <p class="text-sm font-semibold mt-2">No matching jobs found</p>
//                     <p class="text-xs text-slate-400 mt-1">Try resetting filters or searching with different keywords.</p>
//                 </div>
//             `;
//             return;
//         }

//         const cardsHtml = data.items.map(job => `
//             <article class="mb-4 rounded-xl border border-slate-200 p-5 hover:border-[#092d52]/30 hover:shadow-md transition-all bg-white group">
//                 <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
//                     <div class="space-y-2 flex-1 min-w-0">
//                         <div class="flex flex-wrap items-center gap-2">
//                             <h2 class="font-bold text-[#092d52] text-lg hover:text-[#e47b0b] cursor-pointer transition-colors" onclick="viewJobDetail(${job.id})">${escapeHtml(job.title)}</h2>
//                             <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">${escapeHtml(job.employment_type)}</span>
//                         </div>
//                         <p class="text-xs font-semibold text-[#e47b0b] flex items-center gap-3 flex-wrap">
//                             <span><i class="bi bi-building mr-1"></i>${escapeHtml(job.company_name)}</span>
//                             <span><i class="bi bi-geo-alt mr-1"></i>${escapeHtml(job.location || 'Remote')}</span>
//                             ${job.salary_min || job.salary_max ? `<span><i class="bi bi-cash-stack mr-1"></i>PKR ${job.salary_min ? job.salary_min.toLocaleString() : 0} - ${job.salary_max ? job.salary_max.toLocaleString() : 'N/A'}</span>` : ''}
//                             ${job.min_cgpa ? `<span><i class="bi bi-award mr-1"></i>Min CGPA: ${job.min_cgpa}</span>` : ''}
//                         </p>
//                         <p class="text-xs text-slate-600 leading-relaxed line-clamp-2 pt-1">${escapeHtml(job.description)}</p>
//                     </div>
//                     <div class="flex sm:flex-col gap-2 self-start sm:self-center flex-shrink-0">
//                         <button onclick="viewJobDetail(${job.id})" class="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors shadow-sm">Details</button>
//                         <button onclick="showApplyModal(${job.id}, '${escapeHtml(job.title).replace(/'/g, "\\'")}', '${escapeHtml(job.company_name).replace(/'/g, "\\'")}')" class="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-sm">Apply</button>
//                     </div>
//                 </div>
//             </article>
//         `).join('');

//         const paginationHtml = renderPaginationControls(data.total, data.page, data.page_size, 'searchJobs');

//         resultsContainer.innerHTML = cardsHtml + paginationHtml;
//     } catch (error) {
//         showToast(error.message, 'error');
//     }
// }

// // Get Job Detail Modal (GET /api/v1/students/jobs/{job_id})
// async function viewJobDetail(jobId) {
//     try {
//         const job = await API.get(`/students/jobs/${jobId}`);
//         const modalContent = `
//             <div class="space-y-4 text-left">
//                 <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
//                     <p class="text-xs font-bold text-[#e47b0b] uppercase tracking-wider">${escapeHtml(job.company_name || 'Company')}</p>
//                     <h3 class="text-xl font-bold text-[#092d52] mt-0.5">${escapeHtml(job.title)}</h3>
                    
//                     <div class="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
//                         <span class="bg-white border border-slate-200 px-2.5 py-1 rounded-md"><i class="bi bi-briefcase text-[#092d52] mr-1"></i>${escapeHtml(job.employment_type)}</span>
//                         <span class="bg-white border border-slate-200 px-2.5 py-1 rounded-md"><i class="bi bi-geo-alt text-[#092d52] mr-1"></i>${escapeHtml(job.location || 'Remote')}</span>
//                         ${job.min_cgpa ? `<span class="bg-white border border-slate-200 px-2.5 py-1 rounded-md"><i class="bi bi-mortarboard text-[#092d52] mr-1"></i>Min CGPA: ${job.min_cgpa}</span>` : ''}
//                         ${job.application_deadline ? `<span class="bg-white border border-slate-200 px-2.5 py-1 rounded-md"><i class="bi bi-clock-history text-[#092d52] mr-1"></i>Deadline: ${formatDate(job.application_deadline)}</span>` : ''}
//                     </div>
//                 </div>

//                 ${job.salary_min || job.salary_max ? `
//                     <div class="text-xs text-slate-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-2">
//                         <i class="bi bi-cash-stack text-emerald-600 text-lg"></i>
//                         <span><strong>Salary Range:</strong> PKR ${job.salary_min ? job.salary_min.toLocaleString() : 0} - ${job.salary_max ? job.salary_max.toLocaleString() : 'N/A'}</span>
//                     </div>
//                 ` : ''}

//                 <div>
//                     <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</h4>
//                     <div class="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 max-h-48 overflow-y-auto whitespace-pre-wrap">${escapeHtml(job.description)}</div>
//                 </div>

//                 ${job.requirements ? `
//                     <div>
//                         <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Requirements & Qualifications</h4>
//                         <div class="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 max-h-48 overflow-y-auto whitespace-pre-wrap">${escapeHtml(job.requirements)}</div>
//                     </div>
//                 ` : ''}
//             </div>
//         `;

//         showModal('Job Details', modalContent, async () => {
//             showApplyModal(job.id, job.title, job.company_name);
//         });
        
//         const submitBtn = document.querySelector('#custom-modal-form button[type="submit"]');
//         if (submitBtn) {
//             submitBtn.textContent = 'Apply For This Position';
//             submitBtn.className = 'px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors';
//         }
//     } catch (error) {
//         showToast(error.message, 'error');
//     }
// }

// // Show Apply Modal (POST /api/v1/students/jobs/{job_id}/apply)
// function showApplyModal(jobId, jobTitle, companyName) {
//     const formHtml = `
//         <div class="space-y-3">
//             <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
//                 <p class="font-bold">Applying for: ${escapeHtml(jobTitle)}</p>
//                 <p class="text-blue-700">${escapeHtml(companyName)}</p>
//             </div>
//             <div>
//                 <label class="block text-sm font-semibold text-slate-700 mb-1">Cover Letter (Optional)</label>
//                 <textarea id="apply-cover-letter" class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#e47b0b] focus:border-[#e47b0b] outline-none text-sm h-32 resize-none" placeholder="Explain why you are a great fit for this position..."></textarea>
//             </div>
//             <p class="text-[11px] text-slate-500 italic"><i class="bi bi-info-circle mr-1"></i>Your current resume on profile will be attached automatically.</p>
//         </div>
//     `;

//     showModal('Submit Application', formHtml, async () => {
//         const coverLetter = document.getElementById('apply-cover-letter').value || null;
//         await API.post(`/students/jobs/${jobId}/apply`, { cover_letter: coverLetter });
//         showToast('Application submitted successfully!');
//         if (currentTab === 'applications') renderApplications();
//     });

//     const submitBtn = document.querySelector('#custom-modal-form button[type="submit"]');
//     if (submitBtn) {
//         submitBtn.textContent = 'Submit Application';
//         submitBtn.className = 'px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors';
//     }
// }

// // Render Applications tab content (GET /api/v1/students/me/applications)
// async function renderApplications() {
//     appsPage = 1;
//     document.getElementById('tab-content').innerHTML = `
//         <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
//             <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
//                 <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
//                     <i class="bi bi-send text-base text-[#092d52]"></i> My Applications
//                 </h3>
//                 <div class="flex items-center gap-2">
//                     <label class="text-xs font-semibold text-slate-600">Status Filter:</label>
//                     <select id="apps-status-filter" onchange="filterApplications(1)" class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#e47b0b] outline-none">
//                         <option value="">All Statuses</option>
//                         <option value="applied">Applied</option>
//                         <option value="shortlisted">Shortlisted</option>
//                         <option value="accepted">Accepted</option>
//                         <option value="rejected">Rejected</option>
//                         <option value="withdrawn">Withdrawn</option>
//                     </select>
//                 </div>
//             </div>
//             <div id="applications-table-container"></div>
//         </section>
//     `;
//     await filterApplications(1);
// }

// async function filterApplications(page = 1) {
//     appsPage = page;
//     const container = document.getElementById('applications-table-container');
//     if (!container) return;

//     container.innerHTML = `
//         <div class="flex items-center justify-center py-12">
//             <div class="w-8 h-8 border-4 border-[#092d52] border-t-[#e47b0b] rounded-full animate-spin"></div>
//         </div>
//     `;

//     try {
//         const status = document.getElementById('apps-status-filter')?.value || '';
//         let queryParams = `page=${appsPage}&page_size=${pageSize}`;
//         if (status) queryParams += `&status=${encodeURIComponent(status)}`;

//         const data = await API.get(`/students/me/applications?${queryParams}`);

//         if (!data.items || data.items.length === 0) {
//             container.innerHTML = `
//                 <div class="text-center py-12 text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
//                     <i class="bi bi-inbox text-3xl text-slate-300"></i>
//                     <p class="text-sm font-medium mt-2">No applications found.</p>
//                 </div>
//             `;
//             return;
//         }

//         const tableHtml = `
//             <div class="overflow-x-auto rounded-xl border border-slate-200">
//                 <table class="min-w-full text-left text-sm">
//                     <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
//                         <tr>
//                             <th class="px-6 py-3.5">Job Title</th>
//                             <th class="px-6 py-3.5">Company</th>
//                             <th class="px-6 py-3.5">Applied Date</th>
//                             <th class="px-6 py-3.5">Status</th>
//                             <th class="px-6 py-3.5 text-right">Action</th>
//                         </tr>
//                     </thead>
//                     <tbody class="divide-y divide-slate-100 bg-white">
//                         ${data.items.map(item => `
//                             <tr class="hover:bg-slate-50/70 transition-colors">
//                                 <td class="px-6 py-4 font-semibold text-[#092d52]">${escapeHtml(item.job_title)}</td>
//                                 <td class="px-6 py-4 font-medium text-slate-700">${escapeHtml(item.company_name)}</td>
//                                 <td class="px-6 py-4 text-xs text-slate-500 font-medium">${formatDate(item.applied_at)}</td>
//                                 <td class="px-6 py-4">
//                                     <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold 
//                                         ${item.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
//                                           item.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
//                                           item.status === 'withdrawn' ? 'bg-slate-100 text-slate-700' :
//                                           item.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
//                                           'bg-amber-100 text-amber-800'}">
//                                         ${escapeHtml(item.status)}
//                                     </span>
//                                 </td>
//                                 <td class="px-6 py-4 text-right">
//                                     ${['applied', 'shortlisted'].includes(item.status) ? `
//                                         <button onclick="withdraw(${item.id})" class="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors bg-rose-50 px-3 py-1 rounded-md border border-rose-200">Withdraw</button>
//                                     ` : '<span class="text-xs text-slate-400">-</span>'}
//                                 </td>
//                             </tr>
//                         `).join('')}
//                     </tbody>
//                 </table>
//             </div>
//         `;

//         const paginationHtml = renderPaginationControls(data.total, data.page, data.page_size, 'filterApplications');
//         container.innerHTML = tableHtml + paginationHtml;
//     } catch (error) {
//         showToast(error.message, 'error');
//     }
// }

// async function withdraw(id) {
//     showConfirmModal('Withdraw Application', 'Are you sure you want to withdraw this job application?', async () => {
//         await API.post(`/students/me/applications/${id}/withdraw`);
//         showToast('Application withdrawn');
//         filterApplications(appsPage);
//     });
// }

// // Render Interviews tab content (GET /api/v1/students/me/interview-requests)
// async function renderInterviews() {
//     interviewsPage = 1;
//     document.getElementById('tab-content').innerHTML = `
//         <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//             <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
//                 <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
//                     <i class="bi bi-calendar-check text-base text-[#092d52]"></i> Interview Requests
//                 </h3>
//                 <div class="flex items-center gap-2">
//                     <label class="text-xs font-semibold text-slate-600">Status Filter:</label>
//                     <select id="interviews-status-filter" onchange="filterInterviews(1)" class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#e47b0b] outline-none">
//                         <option value="">All Requests</option>
//                         <option value="pending">Pending</option>
//                         <option value="accepted">Accepted</option>
//                         <option value="declined">Declined</option>
//                     </select>
//                 </div>
//             </div>
//             <div id="interviews-container"></div>
//         </section>
//     `;
//     await filterInterviews(1);
// }

// async function filterInterviews(page = 1) {
//     interviewsPage = page;
//     const container = document.getElementById('interviews-container');
//     if (!container) return;

//     container.innerHTML = `
//         <div class="flex items-center justify-center py-12">
//             <div class="w-8 h-8 border-4 border-[#092d52] border-t-[#e47b0b] rounded-full animate-spin"></div>
//         </div>
//     `;

//     try {
//         const status = document.getElementById('interviews-status-filter')?.value || '';
//         let queryParams = `page=${interviewsPage}&page_size=${pageSize}`;
//         if (status) queryParams += `&status=${encodeURIComponent(status)}`;

//         const data = await API.get(`/students/me/interview-requests?${queryParams}`);

//         if (!data.items || data.items.length === 0) {
//             container.innerHTML = `
//                 <div class="text-center py-12 text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
//                     <i class="bi bi-calendar-x text-3xl text-slate-300"></i>
//                     <p class="text-sm font-medium mt-2">No interview requests found.</p>
//                 </div>
//             `;
//             return;
//         }

//         const cardsHtml = data.items.map(item => `
//             <article class="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
//                 <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
//                     <div class="min-w-0 flex-1 space-y-2">
//                         <div class="flex flex-wrap items-center gap-2">
//                             <h2 class="font-bold text-[#092d52] text-base sm:text-lg truncate">${escapeHtml(item.job_title)}</h2>
//                             <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold
//                                 ${item.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
//                                   item.status === 'declined' ? 'bg-rose-100 text-rose-800' :
//                                   'bg-amber-100 text-amber-800'}">
//                                 ${escapeHtml(item.status)}
//                             </span>
//                         </div>
//                         <p class="text-xs font-semibold text-[#e47b0b]">${escapeHtml(item.company_name)}</p>
//                         ${item.interview_date ? `
//                             <p class="text-xs text-slate-600 font-medium flex items-center gap-1">
//                                 <i class="bi bi-calendar-event text-[#092d52]"></i> Scheduled Date: ${formatDate(item.interview_date)}
//                             </p>
//                         ` : ''}
//                         ${item.message ? `
//                             <div class="mt-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
//                                 <strong class="text-slate-900 block mb-1">Message from Employer:</strong>
//                                 ${escapeHtml(item.message)}
//                             </div>
//                         ` : ''}
//                     </div>
                    
//                     ${item.status === 'pending' ? `
//                         <div class="flex sm:flex-col gap-2 self-start sm:self-center flex-shrink-0">
//                             <button onclick="respond(${item.id}, 'accept')" class="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-sm">Accept</button>
//                             <button onclick="respond(${item.id}, 'decline')" class="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors shadow-sm">Decline</button>
//                         </div>
//                     ` : ''}
//                 </div>
//             </article>
//         `).join('');

//         const paginationHtml = renderPaginationControls(data.total, data.page, data.page_size, 'filterInterviews');
//         container.innerHTML = cardsHtml + paginationHtml;
//     } catch (error) {
//         showToast(error.message, 'error');
//     }
// }

// async function respond(id, action) {
//     showConfirmModal(`${action === 'accept' ? 'Accept' : 'Decline'} Interview`, `Are you sure you want to ${action} this interview request?`, async () => {
//         await API.post(`/students/me/interview-requests/${id}/${action}`);
//         showToast(`Interview request ${action}ed successfully`);
//         filterInterviews(interviewsPage);
//     });
// }

