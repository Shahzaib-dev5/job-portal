document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('register-app');
    app.innerHTML = `
        <div class="site-topbar"><div class="topbar-inner"><span><i class="bi bi-mortarboard-fill"></i> CareerConnect University Employment Services</span><span><i class="bi bi-people-fill"></i> Students &nbsp; | &nbsp; <i class="bi bi-building-fill-gear"></i> Employers &nbsp; | &nbsp; <i class="bi bi-headset"></i> Support</span></div></div>
        <nav class="site-nav"><div class="nav-inner">
            <a class="brand" href="/index.html"><img class="nav-logo" src="assets/uet-1.png" alt="UET logo"><span><span class="brand-name">CareerConnect</span><span class="brand-subtitle">University Job Portal</span></span></a>
            <div class="nav-links"><a href="/index.html"><i class="bi bi-house-door-fill"></i> Portal home</a><a href="/login.html"><i class="bi bi-box-arrow-in-right"></i> Employer login</a></div>
        </div></nav>
        <main class="register-page"><div class="register-heading"><div class="hero-kicker"><i class="bi bi-building-fill-check"></i> Build your team with confidence</div><h1>Register your company</h1><p>Join CareerConnect and connect your organisation with skilled students and graduates from the university community.</p></div>
            <form id="company-registration-form" class="registration-form" onsubmit="submitCompanyRegistration(event)">
                <section class="form-section"><div class="form-section-heading"><span>01</span><div><h2><i class="bi bi-building-fill"></i> Company details</h2><p>Tell candidates who you are and what your organisation does.</p></div></div><div class="form-grid"><label class="form-field full">Company name <span class="required">*</span><input name="company_name" type="text" required maxlength="255" placeholder="e.g. Vertex Technologies"></label><label class="form-field">Industry<input name="industry" type="text" maxlength="100" placeholder="e.g. Software and IT"></label><label class="form-field">Company website<input name="website" type="url" placeholder="https://yourcompany.com"></label><label class="form-field full">Company location<input name="location" type="text" maxlength="255" placeholder="City, country"></label><label class="form-field full">Company description<textarea name="description" rows="5" maxlength="2000" placeholder="Briefly describe your organisation, culture, and the opportunities you offer."></textarea></label></div></section>
                <section class="form-section"><div class="form-section-heading"><span>02</span><div><h2><i class="bi bi-person-vcard-fill"></i> Contact information</h2><p>Give applicants and the university a reliable point of contact.</p></div></div><div class="form-grid"><label class="form-field">Contact email<input name="contact_email" type="email" placeholder="careers@yourcompany.com"></label><label class="form-field">Contact phone<input name="contact_phone" type="tel" maxlength="50" placeholder="+92 300 1234567"></label></div></section>
                <section class="form-section"><div class="form-section-heading"><span>03</span><div><h2><i class="bi bi-folder2-open"></i> Registration documents</h2><p>Provide your registration numbers and supporting documents for verification. Choose which registration you will provide and upload the corresponding document.</p></div></div><div class="form-grid">
                    <label class="form-field">Registration type
                        <select name="registration_type" id="registration-type" class="w-full rounded-md border px-3 py-2">
                            <option value="secp">SECP registration</option>
                            <option value="ntn">NTN (National Tax Number)</option>
                            <option value="both">Both</option>
                        </select>
                    </label>

                    <div id="registration-fields" class="sm:col-span-2">
                        <!-- number input and corresponding upload will be inserted here based on selection -->
                    </div>
                </div></section>

                <script>
                    // Initialize registration fields based on selection
                    function renderRegistrationFields() {
                        const sel = document.getElementById('registration-type').value;
                        const details = document.getElementById('registration-details');
                        const docs = document.getElementById('registration-documents');
                        let detailsHtml = '';
                        let docsHtml = '';

                        if (sel === 'secp' || sel === 'both') {
                            detailsHtml += '<label class="form-field">SECP registration number<input name="secp_number" type="text" maxlength="100" placeholder="SECP number"></label>';
                            docsHtml += '<label class="file-field"><span>SECP document</span><input name="secp_document" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"><small>PDF, DOC, DOCX, JPG, PNG</small></label>';
                        }
                        if (sel === 'ntn' || sel === 'both') {
                            detailsHtml += '<label class="form-field">NTN number<input name="ntn_number" type="text" maxlength="100" placeholder="National Tax Number"></label>';
                            docsHtml += '<label class="file-field"><span>NTN document</span><input name="ntn_document" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"><small>PDF, DOC, DOCX, JPG, PNG</small></label>';
                        }

                        details.innerHTML = detailsHtml;
                        docs.innerHTML = docsHtml;
                    }

                    document.addEventListener('change', (e) => {
                        if (e.target && e.target.id === 'registration-type') renderRegistrationFields();
                    });

                    // Render initial state after DOM is ready
                    document.addEventListener('DOMContentLoaded', () => {
                        // If the select exists (it will), render fields
                        const sel = document.getElementById('registration-type');
                        if (sel) renderRegistrationFields();
                    });
                </script>
                <section class="form-section"><div class="form-section-heading"><span>04</span><div><h2><i class="bi bi-shield-lock-fill"></i> Account security</h2><p>These credentials will be used by your organisation to access the employer dashboard.</p></div></div><div class="form-grid"><label class="form-field full">Account email <span class="required">*</span><input name="email" type="email" required placeholder="admin@yourcompany.com"></label><label class="form-field">Password <span class="required">*</span><input id="company-password" name="password" type="password" required minlength="8" placeholder="At least 8 characters"></label><label class="form-field">Confirm password <span class="required">*</span><input id="company-password-confirm" type="password" required minlength="8" placeholder="Re-enter your password"></label></div></section>
                <div class="form-footer"><p><span class="required">*</span> Required fields. Your registration will be reviewed by an administrator before approval.</p><button class="button button-primary register-submit" type="submit"><i class="bi bi-check-circle-fill"></i> Submit company registration</button></div><p id="registration-message" class="registration-message" role="status" hidden></p>
            </form>
        </main>
        <footer class="site-footer"><div class="footer-grid"><div><div class="footer-brand"><img class="footer-logo" src="assets/uet.png" alt="UET logo"><div><span class="brand-name">CareerConnect</span><span class="brand-subtitle">University Job Portal</span></div></div></div><div><h3>For students</h3><a href="/index.html#login" onclick="window.location.href='/index.html#login'; return false;"><i class="bi bi-box-arrow-in-right"></i> Student login</a><a href="/index.html#opportunities" onclick="window.location.href='/index.html#opportunities'; return false;"><i class="bi bi-search"></i> Explore jobs</a></div><div><h3>For employers</h3><a href="/login.html"><i class="bi bi-box-arrow-in-right"></i> Employer login</a><a href="/index.html"><i class="bi bi-house-door-fill"></i> Portal home</a></div></div><div class="copyright">&copy; 2026 CareerConnect University Job Portal. All rights reserved.</div></footer>`;
    });

// --- Registration type dynamic fields (moved out of innerHTML so it runs reliably) ---
function renderRegistrationFields() {
    const selEl = document.getElementById('registration-type');
    if (!selEl) return;
    const sel = selEl.value;
    const container = document.getElementById('registration-fields');
    if (!container) return;

    let html = '';

    // Helper to render a paired number + file input block
    const pairBlock = (labelText, numberName, numberPlaceholder, fileName, fileLabel) => {
        return `
            <div class="registration-pair">
                <label class="form-field">${labelText}<input name="${numberName}" type="text" maxlength="100" placeholder="${numberPlaceholder}"></label>
                <label class="file-field"><span>${fileLabel}</span><input name="${fileName}" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"><small>PDF, DOC, DOCX, JPG, PNG</small></label>
            </div>
        `;
    };

    if (sel === 'secp' || sel === 'both') {
        html += pairBlock('SECP registration number', 'secp_number', 'SECP number', 'secp_document', 'SECP document');
    }
    if (sel === 'ntn' || sel === 'both') {
        html += pairBlock('NTN number', 'ntn_number', 'National Tax Number', 'ntn_document', 'NTN document');
    }

    container.innerHTML = html;
}

// wire up change listener and render initial state after DOM ready
document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'registration-type') renderRegistrationFields();
});

document.addEventListener('DOMContentLoaded', () => {
    // render when the page DOM is ready and after the initial app.innerHTML was inserted
    setTimeout(() => {
        renderRegistrationFields();
    }, 0);
});

async function submitCompanyRegistration(event) {
    event.preventDefault();
    const form = event.target;
    const message = document.getElementById('registration-message');
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    if (values.password !== document.getElementById('company-password-confirm').value) {
        showRegistrationMessage('Passwords do not match.', true);
        return;
    }
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    message.hidden = true;
    try {
        await API.upload('/auth/company/register', formData);
        form.reset();
        showRegistrationMessage('Company registered successfully. Your account is pending administrator approval.', false);
    } catch (error) {
        showRegistrationMessage(error.message, true);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit company registration';
    }
}

function showRegistrationMessage(text, isError) {
    const message = document.getElementById('registration-message');
    message.textContent = text;
    message.className = 'registration-message ' + (isError ? 'registration-error' : 'registration-success');
    message.hidden = false;
    message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}