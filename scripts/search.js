// /scripts/search.js
import { db } from './firebase.js';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAt,
  endAt
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Basit gecikmeli çalıştırıcı
function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Firestore'da kullanıcı ara
async function searchUsers(term) {
  if (!term) return;

  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    orderBy('username'),
    startAt(term),
    endAt(term + '\uf8ff'),
    limit(10)
  );

  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log("Arama Sonuçları:", results);

  // Burada sonuçları UI'ye listelemek istersen, özel bir container'a yazdırabilirsin
}

// Arama kutusuna bağlan
const searchInput = document.getElementById('topbar-search');
if (searchInput) {
  searchInput.addEventListener('input', debounce((e) => {
    const value = e.target.value.trim();
    if (value.length > 1) {
      searchUsers(value.toLowerCase());
    }
  }));
}
