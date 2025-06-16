// dashboard.js
import { auth, db }                      from "./firebase.js";
import {
  doc, setDoc, collection, onSnapshot,
  serverTimestamp, GeoPoint
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// --- DOM ---------------------------------------------------------------
const mapDiv   = document.getElementById("map");
const toggle   = document.getElementById("location-toggle");
const loader   = document.getElementById("loader");
const logout   = document.getElementById("logout-btn");

// --- Global state ------------------------------------------------------
let map, myMarker, watchId = null, visible = true;
const others = new Map();

// --- Auth gate ---------------------------------------------------------
auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "login.html";

  await initMap(user);
  loader.remove();               // UX - yükleyiciyi kaldır
});

// --- Map bootstrap -----------------------------------------------------
async function initMap(user) {
  const { coords } = await getCurrentPos();
  map = L.map(mapDiv, { zoomControl:false, attributionControl:false })
          .setView([coords.latitude, coords.longitude], 14);

  // Dark Matter tile
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
              { subdomains: "abcd" }).addTo(map);

  myMarker = L.marker([coords.latitude, coords.longitude], {
    icon: avatarIcon(user.uid)
  }).addTo(map);

  // canlı konum akışı
  startWatch(user);

  // diğer kullanıcıları dinle
  listenOthers(user.uid);
}

// --- Geo helpers -------------------------------------------------------
function startWatch(user) {
  toggle.onclick = () => {
    visible = !visible;
    if (visible) map.addLayer(myMarker);
    else         map.removeLayer(myMarker);
  };

  watchId = navigator.geolocation.watchPosition(async ({coords}) => {
    const { latitude:lat, longitude:lng } = coords;
    myMarker.setLatLng([lat,lng]);
    await setDoc(doc(db,"activeUsers",user.uid), {
      lat, lng, ts: serverTimestamp()
    }, { merge:true });
  }, console.error, { enableHighAccuracy:true, maximumAge:1e4 });
}

function listenOthers(myUid) {
  onSnapshot(collection(db,"activeUsers"), snap => {
    snap.docChanges().forEach(chg => {
      const uid = chg.doc.id;
      if (uid === myUid) return;

      const { lat,lng } = chg.doc.data();
      if (chg.type === "removed") {
        map.removeLayer(others.get(uid));
        others.delete(uid);
      } else {
        let m = others.get(uid);
        if (!m) {
          m = L.marker([lat,lng], { icon: avatarIcon(uid) }).addTo(map);
          others.set(uid, m);
        } else {
          m.setLatLng([lat,lng]);
        }
      }
    });
  });
}

function avatarIcon(uid) {
  return L.divIcon({
    html: `<div class="avatar-marker" style="background-image:url(https://i.pravatar.cc/100?u=${uid})"></div>`,
    iconSize: [44,44],
    className: ""
  });
}

function getCurrentPos() {
  return new Promise((res,rej)=>
    navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true}));
}

// --- Çıkış -------------------------------------------------------------
logout.onclick = () => auth.signOut().then(()=>location.href="login.html");