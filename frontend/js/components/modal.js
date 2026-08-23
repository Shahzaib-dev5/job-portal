function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.remove();
}

window.closeModal = closeModal;
