// scripts/profile/eventHandlers.js
import { toggleModal }     from './modals.js';
import { uploadAvatar,
         uploadStory }     from './uploader.js';
import { saveProfile }     from './profileSave.js';

export function attachEvents(DOM) {

  /* ────────── Modal Aç/Kapat ────────── */
  DOM.editProfileBtn.addEventListener('click', () =>
    toggleModal(DOM.editProfileModal));

  DOM.addStoryBtn.addEventListener('click', () =>
    toggleModal(DOM.addStoryModal));

  DOM.addStoryAvatar.addEventListener('click', () =>
    toggleModal(DOM.addStoryModal));

  /* ────────── Avatar Güncelleme ────────── */
  DOM.changeAvatar.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      await uploadAvatar(file, (url) => {
        DOM.avatar.src = url;
        alert('Profil fotoğrafı güncellendi!');
      });
    };
    input.click();
  });

  DOM.removeAvatar.addEventListener('click', async () => {
    await uploadAvatar(null, () => {
      DOM.avatar.src = 'https://i.pravatar.cc/150?u=anonymous';
      alert('Fotoğraf kaldırıldı!');
    });
  });

  /* ────────── Hikâye Yükleme ────────── */
  DOM.storyUploadArea.addEventListener('click', () =>
    DOM.storyImage.click());

  DOM.storyImage.addEventListener('change', (e) => {
    if (e.target.files.length) {
      DOM.publishStory.disabled = false;
      DOM.storyUploadArea.innerHTML =
        `<i class="fas fa-check-circle" style="font-size:40px;color:var(--primary);margin-bottom:10px;"></i>
         <p>Dosya seçildi: ${e.target.files[0].name}</p>`;
    }
  });

  DOM.publishStory.addEventListener('click', async () => {
    const file = DOM.storyImage.files[0];
    const caption = DOM.storyCaption.value;

    try {
      await uploadStory(file, caption, () => {
        alert('Hikâye yayınlandı!');
        // Modalı kapat + alanları sıfırla
        toggleModal(DOM.addStoryModal);
        DOM.storyImage.value = '';
        DOM.storyCaption.value = '';
        DOM.publishStory.disabled = true;
        DOM.storyUploadArea.innerHTML =
          `<i class="fas fa-cloud-upload-alt" style="font-size:40px;color:var(--text-light);margin-bottom:10px;"></i>
           <p style="color:var(--text-light)">Sürükle bırak veya tıklayarak seç</p>`;
      });
    } catch (err) {
      console.error(err);
      alert('Yükleme hatası!');
    }
  });

  /* ────────── Profil Bilgisi Kaydetme ────────── */
  DOM.saveProfileBtn.addEventListener('click', async () => {
    const data = {
      fullName:  document.getElementById('editFullName').value,
      username:  document.getElementById('editUsername').value,
      bio:       document.getElementById('editBio').value
    };

    try {
      await saveProfile(data);
      alert('Profil güncellendi!');
      toggleModal(DOM.editProfileModal);
    } catch (err) {
      console.error(err);
      alert('Kaydetme sırasında hata!');
    }
  });

  /* ────────── Avatar Long-Press Popup ────────── */
  let press;
  const show = () => DOM.avatarMenu.classList.add('active');
  const hide = () => DOM.avatarMenu.classList.remove('active');

  DOM.avatar.addEventListener('mousedown',  () => press = setTimeout(show, 500));
  DOM.avatar.addEventListener('mouseup',    () => clearTimeout(press));
  DOM.avatar.addEventListener('mouseleave', () => clearTimeout(press));
  DOM.avatar.addEventListener('touchstart', (e) => { e.preventDefault(); press = setTimeout(show, 500); });
  DOM.avatar.addEventListener('touchend',   hide);
}