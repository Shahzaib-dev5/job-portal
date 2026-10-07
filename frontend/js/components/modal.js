function closeModal(modalToClose = null) {
    // Multiple dialogs may exist briefly while navigating between views.
    // Always close the visible/topmost one first.
    const modals = document.querySelectorAll('#modal-overlay');
    const modal = modalToClose || modals[modals.length - 1];
    if (modal) modal.remove();
}

// Close every dynamically-created modal when the backdrop itself is clicked.
// Event delegation keeps this working for modals added after page load.
document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'modal-overlay') {
        closeModal(event.target);
    }
});

window.closeModal = closeModal;

// Shared form modal helpers used by dashboards that do not define their own
// dashboard-specific modal implementation (for example the admin portal).
function showModal(title, formContent, onSubmit) {
    closeModal();
    document.body.insertAdjacentHTML('beforeend', `
        <div id="modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div class="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
                <div class="flex items-center justify-between border-b-2 border-[#e47b0b] bg-[#092d52] px-6 py-4 text-white">
                    <h3 class="text-base font-bold">${escapeHtml(title)}</h3>
                    <button type="button" onclick="closeModal()" class="text-xl font-bold text-white hover:text-[#e47b0b]">&times;</button>
                </div>
                <form id="shared-modal-form" class="space-y-4 p-6">
                    ${formContent}
                    <div class="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onclick="closeModal()" class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700">Cancel</button>
                        <button type="submit" class="rounded-md bg-[#092d52] px-4 py-2 text-sm font-semibold text-white">Submit</button>
                    </div>
                </form>
            </div>
        </div>`);
    document.getElementById('shared-modal-form').onsubmit = async (event) => {
        event.preventDefault();
        const submit = event.currentTarget.querySelector('button[type="submit"]');
        submit.disabled = true;
        try {
            await onSubmit();
            closeModal();
        } catch (error) {
            submit.disabled = false;
            if (typeof showToast === 'function') showToast(error.message, 'error');
            else console.error(error);
        }
    };
}

function showConfirmModal(title, message, onConfirm) {
    closeModal();
    document.body.insertAdjacentHTML('beforeend', `
        <div id="modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div class="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
                <h3 class="text-lg font-bold text-slate-950">${escapeHtml(title)}</h3>
                <p class="text-sm text-slate-600">${escapeHtml(message)}</p>
                <div class="flex justify-end gap-3">
                    <button type="button" onclick="closeModal()" class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700">Cancel</button>
                    <button type="button" id="shared-confirm-btn" class="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Confirm</button>
                </div>
            </div>
        </div>`);
    document.getElementById('shared-confirm-btn').onclick = async (event) => {
        const button = event.currentTarget;
        button.disabled = true;
        try {
            await onConfirm();
            closeModal();
        } catch (error) {
            button.disabled = false;
            if (typeof showToast === 'function') showToast(error.message, 'error');
            else console.error(error);
        }
    };
}

window.showModal = showModal;
window.showConfirmModal = showConfirmModal;
