// searchUsers.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase konfigürasyon (aynen)
const firebaseConfig = {
  apiKey:            "AIzaSyB2CadxMwGT9L10P5aHGorGh07ZxYqx6_o",
  authDomain:        "fresh-462110.firebaseapp.com",
  projectId:         "fresh-462110",
  storageBucket:     "fresh-462110.appspot.com",
  messagingSenderId: "1070639256758",
  appId:             "1:1070639256758:web:630db0f0134525e603c217",
  measurementId:     "G-W5CLG9SJXC"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ===== Arama Fonksiyonu =====
const searchInput = document.querySelector('#topbar input');

let debounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const term = searchInput.value.trim().toLowerCase();
    if (term.length < 2) return; // En az 2 harf girilmeli
    searchUsers(term);
  }, 300); // 300ms debounce
});

async function searchUsers(keyword) {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(query(usersRef));
  const matches = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const values = [
      data.name?.toLowerCase() || '',
      data.surname?.toLowerCase() || '',
      data.username?.toLowerCase() || '',
      data.email?.toLowerCase() || '',
      data.location?.toLowerCase() || ''
    ];
    const found = values.some(v => v.includes(keyword));
    if (found) {
      matches.push({ id: doc.id, ...data });
    }
  });

  console.clear();
  console.table(matches); // → Geliştirici konsolunda göster
  // İleride: sonuçları DOM'a yaz, kartlara dönüştür, vs.
}