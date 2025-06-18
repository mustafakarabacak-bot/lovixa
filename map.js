/*========================================================
  map.js  |  Lovixa Unified Geo-UI Layer
  --------------------------------------------------------
  • Kendini yükleyen, bağımsız harita katmanı
  • Dinamik Leaflet bootstrap – harici <link> / <script> yok
  • Işık/Karanlık tema toggling (tile switch)
  • Konum yayını aç/kapat – gerçek zamanlı Firestore senkronu
  • Aktif kullanıcılar için avatar tabanlı marker’lar
  • Marker pop-up: Mesaj Gönder | Takip Et | Profili Gör
  ========================================================*/
import { initializeApp }   from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth,          onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore,
         doc, setDoc,
         collection, onSnapshot }  from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

/* ---------- 1.  Dinamik Harita Motoru Yükleyicisi ---------- */
async function loadEngine() {
  if (window.L) return;   // zaten yüklüyse geç
  // CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
  // JS
  await new Promise(res => {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = res;
    document.body.appendChild(s);
  });
}

/* ---------- 2.  Firebase / Firestore Bağlantısı ---------- */
const firebaseConfig = {
  apiKey:            "AIzaSyDslfjDqEpqQekNxh9e4OqYYkxdf2TUI7E",
  authDomain:        "silicon-park-462509-r3.firebaseapp.com",
  projectId:         "silicon-park-462509-r3",
  storageBucket:     "silicon-park-462509-r3.appspot.com",
  messagingSenderId: "463275849598",
  appId:             "1:463275849598:web:19ffa6e6e5e1ff5077252f"
};
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

/* ---------- 3.  UI Yardımcıları ---------- */
const state = {
  map:       null,
  isDark:    false,
  shareLoc:  true,
  myMarker:  null,
  others:    new Map()  // uid -> marker
};
function iconButton(html, title, id) {
  const btn = document.createElement("div");
  btn.id = id;
  btn.title = title;
  btn.style.cssText =
    "background:#1e1e1eaa;border-radius:6px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:18px;";
  btn.innerHTML = html;
  return btn;
}
function createAvatarMarker(lat, lng, avatar, isMe=false) {
  const div = document.createElement("div");
  div.style.cssText =
    `width:${isMe?60:44}px;height:${isMe?60:44}px;border:${isMe?3:2}px solid ${isMe?'#4caf50':'#fff'};box-shadow:0 0 6px #000;border-radius:50%;overflow:hidden;`;
  div.innerHTML = `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover">`;
  return L.marker([lat,lng], {
    icon: L.divIcon({html:div, className:"", iconSize:null})
  });
}

/* ---------- 4.  Harita İnşası ---------- */
async function initMap(user) {
  await loadEngine();
  // Katmanlar
  const lightTiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { attribution:"" });
  const darkTiles  = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",  { attribution:"" });

  state.map = L.map("map", {
    center: [0,0],
    zoom: 2,
    layers:[lightTiles],
    zoomControl:false
  });

  /* ---------- Kontroller ---------- */
  // Tema tuşu
  const themeBtn = iconButton("🌓", "Tema Değiştir", "themeToggle");
  themeBtn.onclick = () => {
    state.isDark = !state.isDark;
    state.map.removeLayer(state.isDark?lightTiles:darkTiles);
    state.map.addLayer(state.isDark?darkTiles:lightTiles);
  };
  // Konum paylaş tuşu
  const locBtn = iconButton("📍", "Konum Göster/Gizle", "locToggle");
  locBtn.onclick = () => {
    state.shareLoc = !state.shareLoc;
    if (state.myMarker) state.myMarker.setOpacity(state.shareLoc?1:0.3);
    updateMyLocation(lastCoords);   // Firestore'e yansıt
  };
  // Ekle
  const ctrl = L.control({position:"topright"});
  ctrl.onAdd = () => {
    const box = L.DomUtil.create("div","");
    box.style.display="flex";
    box.style.flexDirection="column";
    box.style.gap="6px";
    box.appendChild(themeBtn);
    box.appendChild(locBtn);
    return box;
  };
  ctrl.addTo(state.map);

  /* ---------- Konum Akışı ---------- */
  navigator.geolocation.watchPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      lastCoords = { latitude, longitude };
      // İlk kez
      if (!state.myMarker) {
        state.myMarker = createAvatarMarker(latitude, longitude, user.photoURL || "avatar.png", true)
          .addTo(state.map)
          .bindPopup("Bu sensin");
        state.map.setView([latitude, longitude], 14);
      } else {
        state.myMarker.setLatLng([latitude, longitude]);
      }
      updateMyLocation(lastCoords);
    },
    err => console.error(err),
    { enableHighAccuracy:true, maximumAge:10000, timeout:10000 }
  );

  /* ---------- Diğer Kullanıcılar ---------- */
  const colRef = collection(db,"realtimeLocations");
  onSnapshot(colRef, snap => {
    snap.docChanges().forEach(ch => {
      const data = ch.doc.data();
      const uid  = ch.doc.id;
      if (uid === user.uid) return;               // kendimiz
      if (ch.type === "removed" || data.isHidden) {
        // Marker sil
        if (state.others.has(uid)) {
          state.map.removeLayer(state.others.get(uid));
          state.others.delete(uid);
        }
      } else {
        // Ekle/Güncelle
        let m = state.others.get(uid);
        if (!m) {
          m = createAvatarMarker(data.lat, data.lng, data.avatar || "avatar.png");
          m.addTo(state.map)
            .bindPopup(`
              <div style="text-align:center">
                <strong>${data.username || 'Kullanıcı'}</strong><br/>
                <button onclick="window.location.href='chat.html?u=${uid}'">Mesaj</button>
                <button onclick="alert('Takip edildi')">Takip Et</button>
                <button onclick="window.location.href='profile.html?u=${uid}'">Profil</button>
              </div>
            `);
          state.others.set(uid, m);
        } else {
          m.setLatLng([data.lat, data.lng]);
        }
      }
    });
  });
}

/* ---------- 5.  Firestore Senkron Fonksiyonu ---------- */
let lastCoords = null;
async function updateMyLocation({ latitude, longitude }) {
  if (!auth.currentUser) return;
  await setDoc(
    doc(db,"realtimeLocations", auth.currentUser.uid),
    {
      lat: latitude,
      lng: longitude,
      username: auth.currentUser.displayName || "",
      avatar: auth.currentUser.photoURL || "",
      isHidden: !state.shareLoc,
      ts: Date.now()
    },
    { merge:true }
  );
}

/* ---------- 6.  Başlat ---------- */
onAuthStateChanged(auth, user => {
  if (!user) {
    console.warn("Oturum bulunamadı");
    return;
  }
  initMap(user);
});