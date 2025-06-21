// scripts/profile/eventHandlers.js

import { toggleModal } from './modals.js';

export function attachEvents(DOM) {
  // Profili düzenle
  DOM.editProfileBtn.addEventListener('click', () => toggleModal(DOM.editProfileModal));

  // Hikaye ekle (buton ve avatar menü)
  DOM.addStoryBtn.addEventListener('click', () => toggleModal(DOM.addStoryModal));
  DOM.addStoryAvatar.addEventListener('click', () => toggleModal(DOM.addStoryModal));

  // Avatar tıklanırsa hikayeye git (şimdilik simülasyon)
  DOM.avatar.addEventListener('click', () => {
    alert("Hikaye görüntüleniyor...");
  });

  // Uzun basınca avatar menüsünü aç
  let pressTimer;
  const showPopup = () => DOM.avatarMenu.classList.add('active');
  const hidePopup = () => DOM.avatarMenu.classList.remove('active');

  DOM.avatar.addEventListener('mousedown', () => pressTimer = setTimeout(showPopup, 500));
  DOM.avatar.addEventListener('mouseup', hidePopup);
  DOM.avatar.addEventListener('mouseleave', hidePopup);

  DOM.avatar.addEventListener('touchstart', e => {
    e.preventDefault();
    pressTimer = setTimeout(showPopup, 500);
  });
  DOM.avatar.addEventListener('touchend', hidePopup);

  // Hikaye yükleme alanına tıklama
  DOM.storyUploadArea.addEventListener('click', () => DOM.storyImage.click());

  // Dosya seçildiğinde durumu güncelle
  DOM.storyImage.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      DOM.publishStory.disabled = false;
      DOM.storyUploadArea.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 40px; color: var(--primary); margin-bottom: 10px;"></i>
        <p style="margin: 0;">Dosya seçildi: ${e.target.files[0].name}</p>
      `;
    }
  });

  // Takipten çık / takip et / profil işlemleri buraya eklenebilir (ileri geliştirme için)
}