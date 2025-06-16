/* ---------- Firebase Firestore Yardımcıları ---------- */ import { doc, setDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export function initRealtimeMap({ user, mapArea, toggleBtn, db }) { navigator.geolocation.getCurrentPosition( (pos) => { const myLat = pos.coords.latitude; const myLng = pos.coords.longitude;

const map = L.map(mapArea, {
    zoomControl: false,          // + / - butonları kapalı
    attributionControl: false    // "Leaflet" yazısı görülmesin
  }).setView([myLat, myLng], 14);

  // Dark mode tile (CartoDB DarkMatter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd'
  }).addTo(map);

  const selfIcon = avatarIcon(user.uid);
  const selfMarker = L.marker([myLat, myLng], { icon: selfIcon }).addTo(map);
  writeLocation(db, user.uid, myLat, myLng);

  // Konumu 5 sn'de bir güncelle
  setInterval(() => {
    navigator.geolocation.getCurrentPosition((p) => {
      const lat = p.coords.latitude;
      const lng = p.coords.longitude;
      selfMarker.setLatLng([lat, lng]);
      writeLocation(db, user.uid, lat, lng);
    });
  }, 5000);

  // Görünürlük toggle
  let visible = true;
  toggleBtn.onclick = () => {
    visible = !visible;
    if (visible) map.addLayer(selfMarker); else map.removeLayer(selfMarker);
  };

  listenOthers(db, user.uid, map);
},
(err) => alert("Konum alınamadı: " + err.message),
{ enableHighAccuracy: true }

); }

/* ---------- Yardımcı Fonksiyonlar ---------- */ function avatarIcon(uid) { return L.divIcon({ html: <div class='avatar-marker' style='background-image:url(https://i.pravatar.cc/100?u=${uid})'></div>, iconSize: [44, 44], className: '' // Leaflet default class'ını iptal et }); }

function writeLocation(db, uid, lat, lng) { setDoc(doc(db, "activeUsers", uid), { lat, lng, ts: Date.now() }, { merge: true }); }

function listenOthers(db, myUid, map) { const others = new Map(); onSnapshot(collection(db, "activeUsers"), (snap) => { snap.docChanges().forEach((chg) => { const uid = chg.doc.id; if (uid === myUid) return; const d = chg.doc.data();

if (chg.type === "removed") {
    if (others.has(uid)) {
      map.removeLayer(others.get(uid));
      others.delete(uid);
    }
  } else {
    let m = others.get(uid);
    if (!m) {
      m = L.marker([d.lat, d.lng], { icon: avatarIcon(uid) }).addTo(map);
      m.on('click', () => openPopup(uid, m, map));
      others.set(uid, m);
    } else {
      m.setLatLng([d.lat, d.lng]);
    }
  }
});

}); }

function openPopup(uid, marker, map) { const html = `<div class='popup'> <button class='msg-btn' onclick="window.location.href='messages.html?uid=${uid}'">Mesaj</button> <button class='profile-btn' onclick="window.location.href='profile.html?uid=${uid}'">Profil</button>

  </div>`;
  marker.bindPopup(html).openPopup();
}