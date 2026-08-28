document.addEventListener('DOMContentLoaded', () => {
    const publicView = new URLSearchParams(window.location.search).get('view') === 'public';
    if (Auth.isAuthenticated() && !publicView) {
        const user = Auth.getUser();
        const dashboards = {
            super_admin: '/js/dashboards/super-admin-dashboard.html',
            admin: '/js/dashboards/admin-dashboard.html',
            company: '/js/dashboards/company-dashboard.html',
            student: '/js/dashboards/student-dashboard.html'
        };
        window.location.href = dashboards[user?.role] || '/index.html';
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="site-topbar"><div class="topbar-inner"><span><i class="bi bi-mortarboard-fill"></i> CareerConnect University Employment Services</span><span><i class="bi bi-people-fill"></i> Students &nbsp; | &nbsp; <i class="bi bi-building-fill-gear"></i> Employers &nbsp; | &nbsp; <i class="bi bi-headset"></i> Support</span></div></div>
        <nav class="site-nav"><div class="nav-inner">
            <a class="brand" href="/index.html"><img class="nav-logo" src="assets/uet-1.png" alt="UET logo"><span><span class="brand-name">CareerConnect</span><span class="brand-subtitle">University Job Portal</span></span></a>
            <div class="nav-links"><a href="#opportunities"><i class="bi bi-grid-1x2-fill"></i> Opportunities</a><a href="#process"><i class="bi bi-lightbulb-fill"></i> How it works</a><a class="nav-login" href="#login" onclick="openLoginModal(event)"><i class="bi bi-box-arrow-in-right"></i> Login</a><a class="button button-primary" href="/register-company.html"><i class="bi bi-building-add"></i> For employers</a></div>
        </div></nav>
        <main>
            <section class="hero"><div class="hero-content"><div class="hero-kicker">Your next opportunity starts here</div><h1>Connect talent with the right opportunity.</h1><p>Discover meaningful careers, find exceptional talent, and manage every step of the hiring journey through one trusted university job portal.</p><div class="hero-actions"><a class="button button-primary" href="#login" onclick="openLoginModal(event)"><i class="bi bi-search"></i> Explore opportunities</a><a class="button button-outline" href="/register-company.html"><i class="bi bi-briefcase-fill"></i> Post a job</a></div></div><div class="notice"><strong><i class="bi bi-megaphone-fill"></i> Open for applications</strong>Students can explore current vacancies and submit applications. Employers can register and begin building their teams today.</div></section>
            <section id="opportunities" class="section milestones"><div class="section-heading"><h2>Everything you need to move forward</h2><p>A clear path for students, companies, and the teams that support them.</p></div><div class="milestone-grid"><article class="milestone"><div class="milestone-number"><i class="bi bi-mortarboard-fill"></i> &nbsp; 01 &nbsp; STUDENTS</div><h3>Find the right role</h3><p>Browse relevant opportunities and discover positions aligned with your skills, goals, and experience.</p></article><article class="milestone"><div class="milestone-number"><i class="bi bi-building-fill-gear"></i> &nbsp; 02 &nbsp; EMPLOYERS</div><h3>Reach great talent</h3><p>Register your company, publish vacancies, and connect with motivated candidates from the university community.</p></article><article class="milestone"><div class="milestone-number"><i class="bi bi-file-earmark-check-fill"></i> &nbsp; 03 &nbsp; APPLICATIONS</div><h3>Apply with confidence</h3><p>Build your profile, submit applications, and keep track of your progress from one place.</p></article><article class="milestone"><div class="milestone-number"><i class="bi bi-bar-chart-fill"></i> &nbsp; 04 &nbsp; INSIGHT</div><h3>Make better matches</h3><p>Structured profiles and transparent workflows help every opportunity move with purpose.</p></article></div></section>
            <section id="process" class="section process"><div class="process-grid"><div class="process-image" role="img" aria-label="Professionals collaborating in a workplace"></div><div><h2>A simpler way to build your future</h2><p class="process-intro">CareerConnect brings the full recruitment journey together so every person knows what comes next.</p><div class="step"><span class="step-number"><i class="bi bi-person-badge-fill"></i></span><div><h3>Create your profile</h3><p>Students showcase their education, skills, experience, and achievements.</p></div></div><div class="step"><span class="step-number"><i class="bi bi-search-heart-fill"></i></span><div><h3>Discover or publish opportunities</h3><p>Students find suitable jobs while companies share their open positions.</p></div></div><div class="step"><span class="step-number"><i class="bi bi-send-fill"></i></span><div><h3>Submit and review applications</h3><p>Apply online and follow each application through a clear, organized workflow.</p></div></div><div class="step"><span class="step-number"><i class="bi bi-graph-up-arrow"></i></span><div><h3>Connect and grow</h3><p>Move from a strong application to interviews, offers, and lasting careers.</p></div></div></div></div></section>
        </main>
        <footer class="site-footer"><div class="footer-grid"><div><div class="footer-brand"><img class="footer-logo" src="assets/uet.png" alt="UET logo"><div><span class="brand-name">CareerConnect</span><span class="brand-subtitle">University Job Portal</span></div></div><p>The university's trusted space for discovering opportunity and connecting potential with progress.</p></div><div><h3>For students</h3><a href="#login" onclick="openLoginModal(event)"><i class="bi bi-box-arrow-in-right"></i> Student login</a><a href="#login" onclick="openLoginModal(event)"><i class="bi bi-search"></i> Explore jobs</a><a href="#login" onclick="openLoginModal(event)"><i class="bi bi-clipboard-check"></i> Track applications</a></div><div><h3>For employers</h3><a href="/register-company.html"><i class="bi bi-building-add"></i> Register your company</a><a href="#login" onclick="openLoginModal(event)"><i class="bi bi-box-arrow-in-right"></i> Employer login</a><a href="#login" onclick="openLoginModal(event)"><i class="bi bi-kanban-fill"></i> Manage vacancies</a></div></div><div class="copyright">&copy; 2026 CareerConnect University Job Portal. All rights reserved.</div></footer>
        <div id="login-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="login-title" hidden onclick="closeLoginOnBackdrop(event)"><div class="login-modal"><button class="modal-close" type="button" aria-label="Close login" onclick="closeLoginModal()"><i class="bi bi-x-lg"></i></button><h2 id="login-title">Login</h2><p class="modal-lead">Sign in with your registered university email and password.</p><div class="login-tabs"><button id="local-tab" class="login-tab active" type="button" onclick="switchLoginType('local')"><i class="bi bi-building-fill"></i> Company / Admin</button><button id="student-tab" class="login-tab" type="button" onclick="switchLoginType('student')"><i class="bi bi-mortarboard-fill"></i> Student LMS</button></div><form id="local-login" class="login-form" onsubmit="handleLogin(event)"><label class="field">Email Address<input id="email" type="email" required placeholder="you@university.edu"></label><label class="field">Password<input id="password" type="password" required></label><button class="login-submit" type="submit"><i class="bi bi-box-arrow-in-right"></i> Login</button></form><form id="student-login" class="login-form" hidden onsubmit="handleStudentLogin(event)"><label class="field">University Email<input id="student-email" type="email" required placeholder="you@university.edu"></label><label class="field">LMS Password<input id="student-password" type="password" required></label><button class="login-submit" type="submit"><i class="bi bi-box-arrow-in-right"></i> Login with LMS</button></form><p id="login-error" class="login-error" hidden></p><a class="modal-home-link" href="#" onclick="closeLoginModal(event)"><i class="bi bi-house-door-fill"></i> Back to portal home</a></div></div>`;
});

function openLoginModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('login-modal');
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('email').focus();
}

function closeLoginModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('login-modal');
    if (modal) modal.hidden = true;
    document.body.style.overflow = '';
}

function closeLoginOnBackdrop(event) {
    if (event.target.id === 'login-modal') closeLoginModal();
}

function switchLoginType(type) {
    const student = type === 'student';
    document.getElementById('local-login').hidden = student;
    document.getElementById('student-login').hidden = !student;
    document.getElementById('local-tab').classList.toggle('active', !student);
    document.getElementById('student-tab').classList.toggle('active', student);
    document.getElementById('login-error').hidden = true;
    document.getElementById(student ? 'student-email' : 'email').focus();
}

async function handleLogin(event) {
    event.preventDefault();
    await authenticate('/auth/login', { email: document.getElementById('email').value, password: document.getElementById('password').value });
}

async function handleStudentLogin(event) {
    event.preventDefault();
    const email = document.getElementById('student-email').value;
    const password = document.getElementById('student-password').value;
    const errorElement = document.getElementById('login-error');
    errorElement.hidden = true;

    try {
        // Try local login first
        const response = await API.post('/auth/login', { email, password });
        Auth.setAuth(response.access_token, response.user);
        Auth.redirectToDashboard();
        return;
    } catch (localErr) {
        console.info('Landing: local login failed, trying LMS fallback');
        try {
            const response2 = await API.post('/auth/student/login', { email, password });
            Auth.setAuth(response2.access_token, response2.user);
            Auth.redirectToDashboard();
            return;
        } catch (lmsErr) {
            errorElement.textContent = (localErr && localErr.message) || (lmsErr && lmsErr.message) || 'Unable to sign in';
            errorElement.hidden = false;
            return;
        }
    }
}

async function authenticate(endpoint, payload) {
    const errorElement = document.getElementById('login-error');
    errorElement.hidden = true;
    try {
        const response = await API.post(endpoint, payload);
        Auth.setAuth(response.access_token, response.user);
        Auth.redirectToDashboard();
    } catch (error) {
        errorElement.textContent = error.message;
        errorElement.hidden = false;
    }
}