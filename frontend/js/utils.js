function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Resolve stored upload paths for every dashboard (company, student, and admin).
function getUploadUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const apiBase = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL)
        ? CONFIG.API_BASE_URL.replace(/\/api\/v1\/?$/, '')
        : 'http://127.0.0.1:8000';
    return `${apiBase}${path.startsWith('/') ? path : `/${path}`}`;
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Add a consistent show/hide control to every password input, including
// password fields inserted later by modals and dashboard forms.
function setupPasswordVisibilityToggles(root = document) {
    root.querySelectorAll('input[type="password"]').forEach((input) => {
        if (input.closest('.password-input-wrap')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'password-input-wrap';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'password-toggle';
        button.setAttribute('aria-label', 'Show password');
        button.innerHTML = '<i class="bi bi-eye"></i>';
        button.addEventListener('click', () => {
            const visible = input.type === 'text';
            input.type = visible ? 'password' : 'text';
            button.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
            button.innerHTML = `<i class="bi ${visible ? 'bi-eye' : 'bi-eye-slash'}"></i>`;
        });
        wrapper.appendChild(button);
    });
}

// Replace native dropdowns with a searchable UI while keeping the original
// select in place for existing IDs, values, form validation, and onchange handlers.
function setupSearchableSelects(root = document) {
    root.querySelectorAll('select:not(.searchable-select-native):not([data-no-search])').forEach((select) => {
        if (select.closest('.searchable-select')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'searchable-select';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        select.classList.add('searchable-select-native');

        const input = document.createElement('input');
        input.type = 'search';
        input.className = 'searchable-select-input';
        input.autocomplete = 'off';
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-expanded', 'false');
        input.setAttribute('aria-label', select.getAttribute('aria-label') || 'Search options');

        const searchIcon = document.createElement('span');
        searchIcon.className = 'searchable-select-search-icon';
        searchIcon.innerHTML = '<i class="bi bi-search" aria-hidden="true"></i>';
        const chevron = document.createElement('span');
        chevron.className = 'searchable-select-chevron';
        chevron.innerHTML = '<i class="bi bi-chevron-down" aria-hidden="true"></i>';

        const menu = document.createElement('div');
        menu.className = 'searchable-select-menu';
        menu.hidden = true;
        menu.setAttribute('role', 'listbox');
        wrapper.insertBefore(input, select);
        wrapper.insertBefore(searchIcon, select);
        wrapper.insertBefore(chevron, select);
        wrapper.appendChild(menu);

        const renderOptions = (query = '') => {
            const normalized = query.trim().toLowerCase();
            const options = Array.from(select.options).filter(option =>
                !normalized || option.textContent.trim().toLowerCase().includes(normalized)
            );
            menu.innerHTML = '';
            options.forEach((option) => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = `searchable-select-option${option.selected ? ' selected' : ''}`;
                const label = document.createElement('span');
                label.textContent = option.textContent.trim();
                item.appendChild(label);
                if (option.selected) {
                    const check = document.createElement('i');
                    check.className = 'bi bi-check2';
                    check.setAttribute('aria-hidden', 'true');
                    item.appendChild(check);
                }
                item.disabled = option.disabled;
                item.addEventListener('mousedown', (event) => event.preventDefault());
                item.addEventListener('click', () => {
                    select.value = option.value;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    input.value = option.value ? option.textContent.trim() : '';
                    menu.hidden = true;
                    input.setAttribute('aria-expanded', 'false');
                    renderOptions();
                });
                menu.appendChild(item);
            });
            if (!options.length) {
                const empty = document.createElement('p');
                empty.className = 'searchable-select-empty';
                empty.textContent = 'No matching options';
                menu.appendChild(empty);
            }
        };

        const syncValue = () => {
            const selected = Array.from(select.options).find(option => option.selected);
            if (document.activeElement !== input) input.value = selected && selected.value ? selected.textContent.trim() : '';
            input.placeholder = selected && selected.value ? 'Search options...' : (selected?.textContent.trim() || 'Search or select...');
            renderOptions();
        };

        input.addEventListener('focus', () => { input.select(); renderOptions(''); menu.hidden = false; input.setAttribute('aria-expanded', 'true'); });
        input.addEventListener('click', () => { renderOptions(''); menu.hidden = false; input.setAttribute('aria-expanded', 'true'); });
        input.addEventListener('input', () => { renderOptions(input.value); menu.hidden = false; input.setAttribute('aria-expanded', 'true'); });
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') { menu.hidden = true; input.setAttribute('aria-expanded', 'false'); input.blur(); syncValue(); }
            if (event.key === 'Enter') {
                const first = menu.querySelector('.searchable-select-option:not(:disabled)');
                if (first) { event.preventDefault(); first.click(); }
            }
        });
        document.addEventListener('click', (event) => {
            if (!wrapper.contains(event.target)) menu.hidden = true;
        });

        const optionObserver = new MutationObserver(syncValue);
        optionObserver.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['selected', 'disabled'] });
        syncValue();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupPasswordVisibilityToggles();
    setupSearchableSelects();
    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                setupPasswordVisibilityToggles(node);
                setupSearchableSelects(node);
            }
        }));
    }).observe(document.body, { childList: true, subtree: true });
});

function renderPagination(total, currentPage, pageSize, hasMore, tab) {
    const start = total === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
    const end = Math.min(currentPage * pageSize, total);
    return `<div class="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing ${start} - ${end} of ${total}</span><div class="flex gap-2"><button onclick="changePage(${currentPage - 1}, '${tab}')" ${currentPage <= 1 ? 'disabled' : ''} class="rounded-md border px-3 py-2">Previous</button><button onclick="changePage(${currentPage + 1}, '${tab}')" ${!hasMore ? 'disabled' : ''} class="rounded-md border px-3 py-2">Next</button></div></div>`;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-50 rounded-md px-5 py-3 text-white shadow-lg ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}
