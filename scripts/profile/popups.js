// scripts/profile/popups.js

export function togglePopup(popup) {
  if (!popup) return;
  popup.classList.toggle('active');
  document.getElementById("overlay").classList.toggle('active');
}

export function setupPopupEvents(DOM) {
  const overlay = document.getElementById('overlay');

  // Hesap menüsü
  DOM.accountToggle.addEventListener('click', () => togglePopup(DOM.accountMenu));
  DOM.logoutBtn.addEventListener('click', () => {
    alert('Çıkış yapılıyor...');
    // Gerçek uygulamada: await signOut(auth).then(() => location.href = "/loginregisterpage.html");
  });

  // Hızlı düzenle (kalem ikonu)
  DOM.quickEdit.addEventListener('click', () => togglePopup(DOM.quickEditMenu));

  // Profil fotoğrafı işlemleri
  DOM.changeAvatar.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          DOM.avatar.src = event.target.result;
          alert("Profil fotoğrafı güncellendi!");
        };
        reader.readAsDataURL(file);
      }
      DOM.avatarMenu.classList.remove('active');
      overlay.classList.remove('active');
    };
    input.click();
  });

  DOM.removeAvatar.addEventListener('click', () => {
    DOM.avatar.src = "https://i.pravatar.cc/150?u=anonymous";
    alert("Profil fotoğrafı kaldırıldı!");
    DOM.avatarMenu.classList.remove('active');
    overlay.classList.remove('active');
  });

  // Popup'lar için overlay'e tıklayınca kapat
  overlay.addEventListener('click', () => {
    document.querySelectorAll('.popup.active').forEach(p => p.classList.remove('active'));
    overlay.classList.remove('active');
  });
}