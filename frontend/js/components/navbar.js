class Navbar {
    static render(user) {
        const nav = document.createElement('nav');
        nav.className = 'bg-white border-b border-slate-200';
        nav.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center min-h-16 gap-4">
                    <div class="flex items-center gap-3">
                        <a href="/index.html" class="text-xl font-bold text-slate-900">CareerConnect</a>
                        <span class="hidden sm:inline text-xs font-semibold tracking-wide text-slate-500">${user.role.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <div id="notification-bell"></div>
                        <a href="/index.html?view=public" onclick="window.location.href='/index.html?view=public'; return false;" class="hidden sm:inline text-sm text-slate-600 hover:text-slate-950">Home</a>
                        <button onclick="handleLogout()" class="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">Logout</button>
                    </div>
                </div>
            </div>`;
        return nav;
    }
}

function handleLogout() {
    Auth.logout();
}

class NotificationBell {
    static render(unreadCount = 0) {
        return `
            <div class="relative">
                <button aria-label="Open notifications" onclick="toggleNotifications()" class="relative rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                    <span class="text-lg">&#128276;</span>
                    <span id="notification-badge" class="${unreadCount > 0 ? '' : 'hidden'} absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1 text-center text-xs leading-5 text-white">${unreadCount}</span>
                </button>
                <div id="notification-dropdown" class="hidden absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                    <div class="border-b border-slate-100 p-4"><h3 class="font-semibold text-slate-900">Notifications</h3></div>
                    <div id="notification-list" class="max-h-96 overflow-y-auto p-2"><p class="py-4 text-center text-sm text-slate-500">Loading...</p></div>
                </div>
            </div>`;
    }
}

async function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('hidden');
    if (!dropdown.classList.contains('hidden')) await loadNotifications();
}

async function loadNotifications() {
    try {
        const response = await API.get('/notifications/?page=1&page_size=10');
        const list = document.getElementById('notification-list');
        if (!list) return;
        list.innerHTML = response.items.length ? response.items.map(notification => `
            <div class="rounded-md p-3 hover:bg-slate-50 ${notification.is_read ? 'opacity-60' : ''}">
                <p class="text-sm text-slate-800">${notification.message}</p>
                <div class="mt-1 flex items-center justify-between gap-2">
                    <span class="text-xs text-slate-400">${formatDate(notification.created_at)}</span>
                    ${notification.is_read ? '' : `<button onclick="markNotificationRead(${notification.id})" class="text-xs font-medium text-blue-700 hover:underline">Mark read</button>`}
                </div>
            </div>`).join('') : '<p class="py-4 text-center text-sm text-slate-500">No notifications</p>';
    } catch (error) {
        const list = document.getElementById('notification-list');
        if (list) list.innerHTML = `<p class="p-3 text-sm text-rose-600">${error.message}</p>`;
    }
}

async function markNotificationRead(notificationId) {
    await API.patch(`/notifications/${notificationId}/read`);
    await loadNotifications();
    await updateUnreadCount();
}

async function updateUnreadCount() {
    try {
        const response = await API.get('/notifications/unread-count');
        const badge = document.getElementById('notification-badge');
        if (!badge) return;
        badge.textContent = response.unread_count;
        badge.classList.toggle('hidden', response.unread_count < 1);
    } catch (error) {
        console.warn('Unable to load notification count:', error.message);
    }
}
