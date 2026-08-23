document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('register-app');
    app.innerHTML = `
        <div class="site-topbar"><div class="topbar-inner"><span>CareerConnect University Employment Services</span><span>Students &nbsp; | &nbsp; Employers &nbsp; | &nbsp; Support</span></div></div>
        <nav class="site-nav"><div class="nav-inner">
            <a class="brand" href="/index.html"><span class="brand-mark">CC</span><span><span class="brand-name">CareerConnect</span><span class="brand-subtitle">University Job Portal</span></span></a>
            <div class="nav-links"><a href="/index.html">Portal home</a><a href="/login.html">Employer login</a></div>
        </div></nav>
        <main class="register-page"><div class="register-heading"><div class="hero-kicker">Build your team with confidence</div><h1>Register your company</h1><p>Join CareerConnect and connect your organisation with skilled students and graduates from the university community.</p></div>
            <form id="company-registration-form" class="registration-form" onsubmit="submitCompanyRegistration(event)">
                <section class="form-section"><div class="form-section-heading"><span>01</span><div><h2>Company details</h2><p>Tell candidates who you are and what your organisation does.</p></div></div><div class="form-grid"><label class="form-field full">Company name <span class="required">*</span><input name="company_name" type="text" required maxlength="255" placeholder="e.g. Vertex Technologies"></label><label class="form-field">Industry<input name="industry" type="text" maxlength="100" placeholder="e.g. Software and IT"></label><label class="form-field">Company website<input name="website" type="url" placeholder="https://yourcompany.com"></label><label class="form-field full">Company location<input name="location" type="text" maxlength="255" placeholder="City, country"></label><label class="form-field full">Company description<textarea name="description" rows="5" maxlength="2000" placeholder="Briefly describe your organisation, culture, and the opportunities you offer."></textarea></label></div></section>
                <section class="form-section"><div class="form-section-heading"><span>02</span><div><h2>Contact information</h2><p>Give applicants and the university a reliable point of contact.</p></div></div><div class="form-grid"><label class="form-field">Contact email<input name="contact_email" type="email" placeholder="careers@yourcompany.com"></label><label class="form-field">Contact phone<input name="contact_phone" type="tel" maxlength="50" placeholder="+92 300 1234567"></label></div></section>
                <section class="form-section"><div class="form-section-heading"><span>03</span><div><h2>Registration documents</h2><p>Provide your registration numbers and supporting documents for verification.</p></div></div><div class="form-grid"><label class="form-field">SECP registration number<input name="secp_number" type="text" maxlength="100" placeholder="SECP number"></label><label class="form-field">SAP number<input name="sap_number" type="text" maxlength="100" placeholder="SAP number"></label><label class="form-field">NTN number<input name="ntn_number" type="text" maxlength="100" placeholder="National Tax Number"></label><div class="form-field full"><span>Supporting documents</span><div class="document-grid"><label class="file-field"><span>SECP document</span><input name="secp_document" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"><small>PDF, DOC, DOCX, JPG, PNG</small></label><label class="file-field"><span>SAP document</span><input name="sap_document" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"><small>PDF, DOC, DOCX, JPG, PNG</small></label><label class="file-field"><span>NTN document</span><input name="ntn_document" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"><small>PDF, DOC, DOCX, JPG, PNG</small></label></div></div></div></section>
                <section class="form-section"><div class="form-section-heading"><span>04</span><div><h2>Account security</h2><p>These credentials will be used by your organisation to access the employer dashboard.</p></div></div><div class="form-grid"><label class="form-field full">Account email <span class="required">*</span><input name="email" type="email" required placeholder="admin@yourcompany.com"></label><label class="form-field">Password <span class="required">*</span><input id="company-password" name="password" type="password" required minlength="8" placeholder="At least 8 characters"></label><label class="form-field">Confirm password <span class="required">*</span><input id="company-password-confirm" type="password" required minlength="8" placeholder="Re-enter your password"></label></div></section>
                <div class="form-footer"><p><span class="required">*</span> Required fields. Your registration will be reviewed by an administrator before approval.</p><button class="button button-primary register-submit" type="submit">Submit company registration</button></div><p id="registration-message" class="registration-message" role="status" hidden></p>
            </form>
        </main>
        <footer class="site-footer"><div class="copyright">&copy; 2026 CareerConnect University Job Portal. All rights reserved.</div></footer>`;
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