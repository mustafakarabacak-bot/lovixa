// scripts/profile/modals.js

export function toggleModal(modal) {
  if (!modal) return;
  modal.classList.toggle('active');
  const overlay = document.getElementById('overlay');
  overlay.classList.toggle('active');
}

export function closeAllModals() {
  document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));
  document.getElementById("overlay").classList.remove('active');
}

export function setupModalCloseEvents() {
  const overlay = document.getElementById('overlay');

  // Kapama butonları ve iptal butonları
  document.querySelectorAll('.modal-close, .btn-outline').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) modal.classList.remove('active');
      overlay.classList.remove('active');
    });
  });

  // Overlay'e tıklanırsa tüm modal'leri kapat
  overlay.addEventListener('click', () => {
    closeAllModals();
  });

  // Escape tuşu ile kapatma
  document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeAllModals();
  });
}