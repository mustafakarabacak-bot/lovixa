// /scripts/map.js | Lovixa Real‑Time Google Maps Integration
// ---------------------------------------------------------
// Gereksinimler:
// 1. Firebase v9 modüler SDK (firebase.js -> db export edilmeli)
// 2. Google Maps JS API yüklenmeli (dashboard.html)

import { db } from "../scripts/firebase.js";
import {
  doc, setDoc, updateDoc, serverTimestamp,
  collection, onSnapshot, arrayUnion, arrayRemove, getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

let map, authUser, userMarker;
let markers = new Map();
let showLocation = true;
let darkMode = true;
const UPDATE_MS = 5000;

// Map ID'leri
const MAP_ID_DARK = "DEMO_DARK";
const MAP_ID_LIGHT = "DEMO_LIGHT";

// Google Maps callback
window.initMap = initMap;
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 41.015137, lng: 28.97953 },
    zoom: 12,
    mapId: MAP_ID_DARK,
    disableDefaultUI: true,
    gestureHandling: "greedy",
    padding: { top: 60, right: 12, bottom: 60, left: 12 }
  });
  renderControlIcons();
  startFirebaseFlow();
};

function startFirebaseFlow() {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    authUser = user;
    attachLiveLocationUpdater();
    subscribeUsersCollection();
  });
}

function attachLiveLocationUpdater() {
  const userRef = doc(db, "users", authUser.uid);
  const update = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      await setDoc(userRef, {
        lat, lng,
        lastSeen: serverTimestamp(),
        photo: authUser.photoURL || "",
        username: authUser.displayName || ""
      }, { merge: true });
      placeUserMarker({ lat, lng });
    });
  };
  update();
  setInterval(update, UPDATE_MS);
}

function subscribeUsersCollection() {
  const col = collection(db, "users");
  onSnapshot(col, (snap) => {
    snap.docChanges().forEach(async (chg) => {
      const data = chg.doc.data();
      const uid = chg.doc.id;
      if (uid === authUser.uid) return;

      const pos = { lat: data.lat, lng: data.lng };
      if (chg.type === "removed") {
        markers.get(uid)?.setMap(null);
        markers.delete(uid);
      } else {
        if (!markers.has(uid)) {
          const m = createFriendMarker(uid, data, pos);
          markers.set(uid, m);
        } else {
          markers.get(uid).setPosition(pos);
        }
      }
    });
  });
}

function placeUserMarker(position) {
  if (userMarker) userMarker.setMap(null);
  const icon = {
    url: makeCircularImage(authUser.photoURL || "https://via.placeholder.com/96", 96, "#4caf50"),
    scaledSize: new google.maps.Size(48, 48)
  };
  userMarker = new google.maps.Marker({ position, map, icon, zIndex: 999 });
  userMarker.setVisible(showLocation);
  map.setCenter(position);
}

function createFriendMarker(uid, data, position) {
  const icon = {
    url: makeCircularImage(data.photo || "https://via.placeholder.com/96", 80, "#4285f4"),
    scaledSize: new google.maps.Size(40, 40)
  };
  const marker = new google.maps.Marker({ position, map, icon });
  marker.addListener("click", () => openFriendPopup(uid, data, marker));
  return marker;
}

function openFriendPopup(uid, data, marker) {
  const container = document.createElement("div");
  container.style.width = "220px";
  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;">
      <img src="${data.photo}" style="width:48px;height:48px;border-radius:50%" />
      <strong>${data.username || "Kullanıcı"}</strong>
    </div>
    <button onclick="location.href='/messages.html?uid=${uid}'">Mesaj Gönder</button>
    <button onclick="location.href='/profile.html?uid=${uid}'">Profili Gör</button>
    <button onclick="toggleFollow('${uid}')">${data.followers?.includes(authUser.uid) ? 'Takipten Çık' : 'Takip Et'}</button>
    <button onclick="blockUser('${uid}')">Engelle</button>
    ${data.hasStory ? `<button onclick="location.href='/story.html?uid=${uid}'">Hikayeyi Gör</button>` : ""}`;

  const info = new google.maps.InfoWindow({ content: container });
  info.open({ map, anchor: marker });
}

window.toggleFollow = async (uid) => {
  const themRef = doc(db, "users", uid);
  const snap = await getDoc(themRef);
  const isFollowing = snap.data()?.followers?.includes(authUser.uid);
  await updateDoc(themRef, {
    followers: isFollowing ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid)
  });
};

window.blockUser = async (uid) => {
  const meRef = doc(db, "users", authUser.uid);
  await updateDoc(meRef, { blocked: arrayUnion(uid) });
  alert("Kullanıcı engellendi");
};

function renderControlIcons() {
  const locBtn = createFloatingBtn("📍", "Konum", "88px");
  const themeBtn = createFloatingBtn("🌓", "Tema", "28px");
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

function createFloatingBtn(content, title, bottom) {
  const div = document.createElement("div");
  div.textContent = content;
  Object.assign(div.style, {
    position: "absolute",
    right: "12px",
    bottom,
    background: "#1e1e1e",
    color: "#fff",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,.5)",
    zIndex: 1000
  });
  div.title = title;
  document.body.appendChild(div);
  return div;
}

function makeCircularImage(src, size = 96, border = "#fff") {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  img.onload = () => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, size, size);
    ctx.restore();
    if (border) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = border;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  };
  return c.toDataURL();
}
