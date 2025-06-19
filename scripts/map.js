// /scripts/map.js  |  Lovixa Real-Time Google Maps Integration
// -----------------------------------------------------------
// Gereksinimler:
// 1. firebase.js  →  export const app = initializeApp(firebaseConfig)
// 2. dashboard.html  →  <script src="https://maps.googleapis.com/maps/api/js?key=API_KEY&callback=initMap&libraries=places" async defer></script>
// -----------------------------------------------------------
// Özellikler:
// • 5 sn’de bir canlı konum güncelleme          • Konum göster / gizle ikonu
// • Dark / Light özel MapID geçişi             • Profil fotoğraflı ana marker
// • Firestore onSnapshot ile diğer kullanıcılar • Marker pop-up: Profil • Mesaj • Takip • Engelle
// -----------------------------------------------------------

import { db } from "../scripts/firebase.js";
import {
  doc, setDoc, updateDoc, serverTimestamp,
  collection, onSnapshot, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// ---- Map sabitleri ---- //
const MAP_ID_DARK  = "DEMO_DARK";   // Google-Maps-Studio’dan stil üret → ID koy
const MAP_ID_LIGHT = "DEMO_LIGHT";
const UPDATE_MS    = 5000;          // Konum yenileme aralığı (ms)

// ---- Global durum ---- //
let map, authUser, userMarker;
const markers     = new Map();      // {uid → marker}
let showLocation  = true;
let darkMode      = true;
let unsubscribe;                    // Firestore dinleyici iptali

// ---- Google callback ---- //
window.initMap = () => {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.015137, lng: 28.97953 }, // İstanbul fallback
    zoom: 12,
    mapId: MAP_ID_DARK,
    disableDefaultUI: true,
    gestureHandling: "greedy",
    padding: { top: 60, right: 12, bottom: 60, left: 12 }
  });

  renderControlIcons();
  firebaseFlow();
};

// ---- Firebase auth & canlı takip ---- //
function firebaseFlow() {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (!user) { console.warn("Login required"); return; }
    authUser = user;
    startLiveLocation();
    startUsersListener();
  });
}

// 1️⃣  Kendi konumunu 5 sn’de bir güncelle
function startLiveLocation() {
  if (!navigator.geolocation) { console.warn("No Geolocation"); return; }

  const userRef = doc(db, "users", authUser.uid);

  const pushLocation = () => {
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      await setDoc(userRef, {
        lat, lng,
        lastSeen : serverTimestamp(),
        photo    : authUser.photoURL   || "",
        username : authUser.displayName|| "",
      }, { merge:true });
      placeUserMarker({ lat, lng });
    });
  };

  pushLocation();                  // ilk çağrı
  setInterval(pushLocation, UPDATE_MS);
}

// 2️⃣ Diğer kullanıcıları dinle
function startUsersListener() {
  unsubscribe?.();                 // varsa kapat
  unsubscribe = onSnapshot(collection(db, "users"), snap => {
    snap.docChanges().forEach(chg => {
      const uid  = chg.doc.id;
      const data = chg.doc.data();
      if (uid === authUser.uid) return;   // kendimiz
      if (chg.type === "removed") {
        markers.get(uid)?.setMap(null);
        markers.delete(uid);
      } else {
        const pos = { lat: data.lat, lng: data.lng };
        if (!markers.has(uid)) {
          markers.set(uid, makeFriendMarker(uid, data, pos));
        } else {
          markers.get(uid).setPosition(pos);
        }
      }
    });
  });
}

// ---- Marker yardımcıları ---- //
function placeUserMarker(position) {
  if (userMarker) userMarker.setMap(null);
  userMarker = new google.maps.Marker({
    position,
    map,
    icon: {
      url        : circleImage(authUser.photoURL || "https://via.placeholder.com/96", 96, "#4caf50"),
      scaledSize : new google.maps.Size(48,48)
    },
    zIndex: 999
  });
  userMarker.setVisible(showLocation);
  map.setCenter(position);
}

function makeFriendMarker(uid, data, position) {
  const marker = new google.maps.Marker({
    position, map,
    icon: {
      url        : circleImage(data.photo || "https://via.placeholder.com/96", 80, "#4285f4"),
      scaledSize : new google.maps.Size(40,40)
    }
  });
  marker.addListener("click", () => openFriendPopup(uid, data, marker));
  return marker;
}

// ---- Popup içeriği ---- //
function openFriendPopup(uid, data, marker) {
  const c  = document.createElement("div");
  c.style.width = "200px";
  c.style.fontFamily = "Segoe UI, sans-serif";
  c.innerHTML = `
    <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;">
      <img src="${data.photo}" style="width:48px;height:48px;border-radius:50%" />
      <strong>${data.username || "Kullanıcı"}</strong>
    </div>
    <button id="msg"     style="${btn("#4285f4")}">Mesaj Gönder</button>
    <button id="follow"  style="${btn("#4caf50")}">
      ${data.followers?.includes(authUser.uid) ? "Takipten Çık" : "Takip Et"}
    </button>
    <button id="profile" style="${btn("#616161")}">Profili Gör</button>
    <button id="block"   style="${btn("#e53935")}">Engelle</button>`;

  const info = new google.maps.InfoWindow({ content: c });
  info.open({ map, anchor: marker });

  c.querySelector("#msg").onclick     = () => location.href = `/messages.html?uid=${uid}`;
  c.querySelector("#profile").onclick = () => location.href = `/profile.html?uid=${uid}`;
  c.querySelector("#block").onclick   = () => blockUser(uid);
  c.querySelector("#follow").onclick  = () => toggleFollow(uid, data.followers?.includes(authUser.uid));
}

const btn = (bg) => `width:100%;padding:.35rem;border:none;border-radius:8px;color:#fff;margin-bottom:.25rem;background:${bg};cursor:pointer;`;

// ---- Takip & Engelle ---- //
async function toggleFollow(uid, isFollowing) {
  const themRef = doc(db, "users", uid);
  await updateDoc(themRef, {
    followers: isFollowing ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid)
  });
}
async function blockUser(uid) {
  await updateDoc(doc(db, "users", authUser.uid), { blocked: arrayUnion(uid) });
  alert("Kullanıcı engellendi");
}

// ---- Kontrol ikonları ---- //
function renderControlIcons() {
  const locBtn   = floatingBtn("📍", "Konum Göster / Gizle", "88px");
  const themeBtn = floatingBtn("🌓", "Tema Değiştir",        "28px");

  locBtn.onclick = () => {
    showLocation = !showLocation;
    userMarker?.setVisible(showLocation);
    locBtn.style.opacity = showLocation ? "1" : ".4";
  };
  themeBtn.onclick = () => {
    darkMode = !darkMode;
    map.setMapId(darkMode ? MAP_ID_DARK : MAP_ID_LIGHT);
  };
}
function floatingBtn(txt, title, bottom) {
  const d = document.createElement("div");
  d.textContent = txt;
  Object.assign(d.style, {
    position:"absolute", right:"12px", bottom, background:"#1e1e1e",
    width:"40px", height:"40px", borderRadius:"50%", color:"#fff",
    display:"flex", alignItems:"center", justifyContent:"center",
    cursor:"pointer", boxShadow:"0 2px 6px rgba(0,0,0,.5)", zIndex:1000
  });
  d.title = title; document.body.appendChild(d); return d;
}

// ---- Yardımcı: Fotoğrafı daire DataURL yap ---- //
function circleImage(src, size = 96, border = "#fff") {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const img = new Image(); img.crossOrigin = "anonymous"; img.src = src;
  img.onload = () => {
    ctx.save();
    ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx.closePath(); ctx.clip();
    ctx.drawImage(img, 0, 0, size, size); ctx.restore();
    if (border) { ctx.lineWidth = 4; ctx.strokeStyle = border; ctx.stroke(); }
  };
  return c.toDataURL();
}
