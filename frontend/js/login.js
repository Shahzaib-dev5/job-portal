document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isAuthenticated()) {
        Auth.redirectToDashboard();
        return;
    }

    document.getElementById('login-app').innerHTML = `
        <div class="login-page"><div class="login-shell">
            <a class="brand login-brand" href="/index.html"><span class="brand-mark">CC</span><span><span class="brand-name">CareerConnect</span><span class="brand-subtitle">University Job Portal</span></span></a>
            <div class="login-card"><h1>Login</h1><p class="modal-lead">Sign in with your registered university email and password.</p>
                <div class="login-tabs"><button type="button" onclick="switchLoginType('local')" id="local-tab" class="login-tab active">Company / Admin</button><button type="button" onclick="switchLoginType('student')" id="student-tab" class="login-tab">Student LMS</button></div>
                <form id="local-login" class="login-form" onsubmit="handleLogin(event)"><label class="field">Email Address<input type="email" id="email" required placeholder="you@university.edu"></label><label class="field">Password<input type="password" id="password" required></label><button type="submit" class="login-submit">Login</button></form>
                <form id="student-login" class="login-form" hidden onsubmit="handleStudentLogin(event)"><label class="field">University Email<input type="email" id="student-email" required placeholder="you@university.edu"></label><label class="field">LMS Password<input type="password" id="student-password" required></label><button type="submit" class="login-submit">Login with LMS</button></form>
                <p id="login-error" class="login-error" hidden></p><a class="modal-home-link" href="/index.html">Back to portal home</a>
            </div>
        </div></div>`;
});

function switchLoginType(type) {
    const student = type === 'student';
    document.getElementById('local-login').hidden = student;
    document.getElementById('student-login').hidden = !student;
    document.getElementById('local-tab').classList.toggle('active', !student);
    document.getElementById('student-tab').classList.toggle('active', student);
    document.getElementById('login-error').hidden = true;
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    errorElement.classList.add('hidden');

    try {
        const response = await API.post('/auth/login', { email, password });
        Auth.setAuth(response.access_token, response.user);
        Auth.redirectToDashboard();
    } catch (error) {
        errorElement.textContent = error.message || 'Unable to sign in. Please check your credentials.';
        errorElement.classList.remove('hidden');
    }
}

async function handleStudentLogin(event) {
    event.preventDefault();
    await authenticate('/auth/student/login', {
        email: document.getElementById('student-email').value,
        password: document.getElementById('student-password').value
    });
}

async function authenticate(endpoint, payload) {
    const errorElement = document.getElementById('login-error');
    errorElement.classList.add('hidden');
    try {
        const response = await API.post(endpoint, payload);
        Auth.setAuth(response.access_token, response.user);
        Auth.redirectToDashboard();
    } catch (error) {
        errorElement.textContent = error.message;
        errorElement.classList.remove('hidden');
    }
}