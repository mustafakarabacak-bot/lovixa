let map;
let userMarker;
const activeUsers = {};

document.addEventListener('DOMContentLoaded', () => {
  // Auth kontrolü
  watchAuthState();
  
  // Haritayı başlat
  initMap();
  
  // Aktif kullanıcıları güncelle
  setInterval(updateActiveStatus, 30000);
  setInterval(fetchActiveUsers, 10000);
});

function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      
      map = L.map('map').setView([latitude, longitude], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      
      // Kendi konum işaretçisi
      addUserMarker(latitude, longitude);
      
      // Aktif kullanıcıları getir
      fetchActiveUsers();
    }, handleLocationError);
  } else {
    alert('Tarayıcınız konum servislerini desteklemiyor');
  }
}

function addUserMarker(lat, lng) {
  const user = firebase.auth().currentUser;
  if (!user) return;
  
  const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<img src="${user.photoURL || 'default-avatar.png'}" class="avatar">`,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  
  userMarker = L.marker([lat, lng], { icon: userIcon })
    .addTo(map)
    .bindPopup('Sizin konumunuz');
}

async function fetchActiveUsers() {
  const oneMinAgo = new Date(Date.now() - 60000);
  const usersRef = firebase.firestore().collection('users');
  const snapshot = await usersRef
    .where('lastSeen', '>', oneMinAgo)
    .get();
  
  snapshot.forEach(doc => {
    const user = doc.data();
    if (user.uid === firebase.auth().currentUser?.uid) return;
    
    if (!activeUsers[user.uid]) {
      addUserToMap(user);
    }
    activeUsers[user.uid] = user;
  });
}

function addUserToMap(user) {
  const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<img src="${user.photoURL || 'default-avatar.png'}" class="avatar">`,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  
  const marker = L.marker([user.location.lat, user.location.lng], { icon: userIcon })
    .addTo(map)
    .bindPopup(`
      <div class="user-popup">
        <h3>${user.displayName}</h3>
        <button onclick="messageUser('${user.uid}')">Mesaj Gönder</button>
        <button onclick="toggleFollow('${user.uid}')">Takip Et</button>
        <a href="/profile.html?uid=${user.uid}">Profili Gör</a>
      </div>
    `);
}

async function updateActiveStatus() {
  const user = firebase.auth().currentUser;
  if (!user) return;
  
  await firebase.firestore().collection('users').doc(user.uid).update({
    lastSeen: new Date(),
    location: new firebase.firestore.GeoPoint(
      userMarker.getLatLng().lat,
      userMarker.getLatLng().lng
    )
  });
}

function handleLocationError(error) {
  console.error('Konum hatası:', error);
  // Varsayılan konum (İstanbul)
  map = L.map('map').setView([41.0082, 28.9784], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}