document.addEventListener('DOMContentLoaded', async () => {
  // Üst menüyü yükle
  const topbarContainer = document.getElementById('topbar-container');
  const topbarResponse = await fetch('topbar.html');
  topbarContainer.innerHTML = await topbarResponse.text();
  
  // Alt menüyü yükle
  const bottomNavContainer = document.getElementById('bottom-nav-container');
  const bottomNavResponse = await fetch('bottom-nav.html');
  bottomNavContainer.innerHTML = await bottomNavResponse.text();
  
  // UI olaylarını başlat
  if (typeof initUIEvents === 'function') {
    initUIEvents();
  }
  
  // Kullanıcı avatarını yükle
  loadUserAvatar();
});

function loadUserAvatar() {
  const user = firebase.auth().currentUser;
  if (user && user.photoURL) {
    const avatars = document.querySelectorAll('.avatar');
    avatars.forEach(avatar => {
      avatar.src = user.photoURL;
      avatar.onerror = () => {
        avatar.src = 'default-avatar.png';
      };
    });
  }
}