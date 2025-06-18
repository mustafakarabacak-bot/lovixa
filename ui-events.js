function initUIEvents() {
  // Artı butonu etkileşimi
  const addButton = document.querySelector('.add-button');
  if (addButton) {
    addButton.addEventListener('click', (e) => {
      const menu = document.querySelector('.add-menu');
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
      e.stopPropagation();
    });
    
    document.addEventListener('click', () => {
      document.querySelector('.add-menu').style.display = 'none';
    });
  }
  
  // Menü aktif öğesini güncelle
  updateActiveMenu();
  
  // Hikaye ve fotoğraf butonları
  document.getElementById('add-story')?.addEventListener('click', () => {
    console.log('Hikaye ekleme tetiklendi');
    // Hikaye ekleme mantığı
  });
  
  document.getElementById('add-photo')?.addEventListener('click', () => {
    console.log('Fotoğraf paylaşma tetiklendi');
    // Fotoğraf paylaşma mantığı
  });
}

function updateActiveMenu() {
  const path = window.location.pathname.split('/').pop();
  const menuItems = document.querySelectorAll('.nav-item');
  
  menuItems.forEach(item => {
    item.classList.remove('active');
    const link = item.getAttribute('href');
    if (link && link.includes(path)) {
      item.classList.add('active');
    }
  });
}