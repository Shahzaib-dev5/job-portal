function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

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