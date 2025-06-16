/* ---------- Firebase & Oturum Yönetimi ---------- */
import { initializeApp }   from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore }    from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { initRealtimeMap } from "./maps.js";

/* Firebase config – senin verilerin */
const firebaseConfig = {
  apiKey:            "AIzaSyDslfjDqEpqQekNxh9e4OqYYkxdf2TUI7E",
  authDomain:        "silicon-park-462509-r3.firebaseapp.com",
  projectId:         "silicon-park-462509-r3",
  storageBucket:     "silicon-park-462509-r3.appspot.com",
  messagingSenderId: "463275849598",
  appId:             "1:463275849598:web:19ffa6e6e5e1ff5077252f"
};

const app  = initializeApp( firebaseConfig );
const auth = getAuth( app );
const db   = getFirestore( app );

/* ---------- DOM Referansları ---------- */
const loader   = document.getElementById("loader");
const mapArea  = document.getElementById("map");
const toggleBtn= document.getElementById("location-toggle");

const showLoader = () => { loader.style.display = "flex";  mapArea.style.display = "none";  };
const showMap    = () => { loader.style.display = "none"; mapArea.style.display = "block"; };

showLoader();                     // başta loader açık

/* ---------- 10 sn Fallback ---------- */
const fallback = setTimeout(() => {
  if (!auth.currentUser) window.location.href = "login.html";
}, 10_000);

/* ---------- Oturum Dinleyicisi ---------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;              // hâlâ oturum yok
  clearTimeout(fallback);         // fallback’i iptal et
  await waitForMapsSDK();         // Maps JS yüklendi mi?
  showMap();
  initRealtimeMap({ user, mapArea, toggleBtn, db });   // harita + konum başlat
});

/* ---------- Google Maps SDK hazır mı? ---------- */
function waitForMapsSDK() {
  return new Promise((resolve) => {
    if (window.google && window.google.maps) resolve();
    else window.addEventListener("load", resolve, { once: true });
  });
}