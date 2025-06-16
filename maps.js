/* ---------- Firebase Firestore ---------- */
import { doc, setDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

/**
 * Realtime harita ve konum yönetimi
 * @param {Object} param0
 *  - user      : Firebase kullanıcısı
 *  - mapArea   : <main id="map">
 *  - toggleBtn : konum göster/gizle butonu
 *  - db        : Firestore referansı
 */
export function initRealtimeMap({ user, mapArea, toggleBtn, db }) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const start = { lat: pos.coords.latitude, lng: pos.coords.longitude };

      const map = createMap(mapArea, start);
      const selfMarker = addAvatarMarker(map, user.uid, start);
      handleToggleVisibility(selfMarker, map, toggleBtn);

      writeLocation(db, user.uid, start);

      // 5 saniyede bir konum güncelle
      setInterval(() => {
        navigator.geolocation.getCurrentPosition((p) => {
          const cur = { lat: p.coords.latitude, lng: p.coords.longitude };
          selfMarker.position = cur;
          writeLocation(db, user.uid, cur);
        });
      }, 5000);

      listenOthers(db, user.uid, map);
    },
    (err) => alert("Konum alınamadı: " + err.message),
    { enableHighAccuracy: true }
  );
}

/* ---------- Harita Oluştur ---------- */
function createMap(el, center) {
  return new google.maps.Map(el, {
    center,
    zoom: 14,
    mapId: "a772948b1f9c04b5"     // koyu tema ID (opsiyonel)
  });
}

/* ---------- Avatar Marker ---------- */
function avatarHTML(url) {
  const d = document.createElement("div");
  d.className = "avatar-marker";
  d.style.backgroundImage = `url(${url})`;
  return d;
}
function addAvatarMarker(map, uid, pos) {
  return new google.maps.marker.AdvancedMarkerElement({
    map,
    position: pos,
    content: avatarHTML(`https://i.pravatar.cc/100?u=${uid}`)
  });
}

/* ---------- Konum Görünürlüğü Toggle ---------- */
function handleToggleVisibility(marker, map, btn) {
  let visible = true;
  btn.onclick = () => {
    visible = !visible;
    marker.map = visible ? map : null;
  };
}

/* ---------- Firestore Konum Yaz ---------- */
function writeLocation(db, uid, c) {
  setDoc(doc(db, "activeUsers", uid), {
    lat: c.lat,
    lng: c.lng,
    ts: Date.now()
  }, { merge: true });
}

/* ---------- Diğer Kullanıcıları Dinle ---------- */
function listenOthers(db, myUid, map) {
  const others = new Map();

  onSnapshot(collection(db, "activeUsers"), (snap) => {
    snap.docChanges().forEach((ch) => {
      const uid = ch.doc.id;
      if (uid === myUid) return;

      const data = ch.doc.data();

      if (ch.type === "removed") {
        if (others.has(uid)) {
          others.get(uid).map = null;
          others.delete(uid);
        }
        return;
      }

      let marker = others.get(uid);
      if (!marker) {
        marker = addAvatarMarker(map, uid, { lat: data.lat, lng: data.lng });
        attachPopup(marker, uid, map);
        others.set(uid, marker);
      } else {
        marker.position = { lat: data.lat, lng: data.lng };
      }
    });
  });
}
function attachPopup(marker, uid, map) {
  marker.addListener("gmp-click", () => {
    const info = new google.maps.InfoWindow({
      content: `
        <div class="popup">
          <button class="msg-btn" onclick="window.location.href='messages.html?uid=${uid}'">
            Mesaj
          </button>
          <button class="profile-btn" onclick="window.location.href='profile.html?uid=${uid}'">
            Profil
          </button>
        </div>`
    });
    info.open(map, marker);
  });
}