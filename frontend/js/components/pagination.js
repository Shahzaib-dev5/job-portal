function renderPagination(total, currentPage, pageSize, hasMore, tab) {
    const start = total === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
    const end = Math.min(currentPage * pageSize, total);
    return `
        <div class="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Showing ${start} - ${end} of ${total}</span>
            <div class="flex gap-2">
                <button onclick="changePage(${currentPage - 1}, '${tab}')" ${currentPage <= 1 ? 'disabled' : ''} class="rounded-md border border-slate-200 px-3 py-2 ${currentPage <= 1 ? 'cursor-not-allowed text-slate-300' : 'hover:bg-slate-50'}">Previous</button>
                <button onclick="changePage(${currentPage + 1}, '${tab}')" ${!hasMore ? 'disabled' : ''} class="rounded-md border border-slate-200 px-3 py-2 ${!hasMore ? 'cursor-not-allowed text-slate-300' : 'hover:bg-slate-50'}">Next</button>
            </div>
        </div>`;
}

window.changePage = function(page, tab) {
    if (page < 1) return;
    window.currentPage = page;
    if (typeof window.switchTab === 'function') window.switchTab(tab);
};
