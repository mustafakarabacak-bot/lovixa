// /scripts/search.js

import { db } from './firebase.js';
import {
  collection,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// 🔁 Gecikmeli tetikleme (debounce)
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// 🔍 Firestore'da kullanıcı ara
async function searchUsers(term) {
  if (!term) return [];

  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    orderBy("username"),
    startAt(term),
    endAt(term + "\uf8ff"),
    limit(10)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 🧱 UI render (listeleme)
function renderResults(users) {
  const container = document.getElementById("search-results");
  container.innerHTML = "";

  if (!users.length) {
    container.innerHTML = "<div style='padding: 8px; color: gray;'>Sonuç yok</div>";
    return;
  }

  users.forEach(user => {
    const item = document.createElement("div");
    item.className = "search-user-item";
    item.innerHTML = `
      <img src="${user.photoURL || 'https://via.placeholder.com/40'}" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 10px;" />
      <span>${user.username || user.email}</span>
    `;
    item.style.cssText = `
      display: flex;
      align-items: center;
      padding: 8px;
      cursor: pointer;
      border-bottom: 1px solid #333;
    `;

    // ⬇️ Tıklanınca detay popup açılır (şu an sadece log)
    item.onclick = () => {
      console.log("Seçilen kullanıcı:", user);
      alert(`Kullanıcı: ${user.username || user.email}`);
    };

    container.appendChild(item);
  });
}

// 🔗 Arama kutusuna bağlan
const searchInput = document.getElementById("topbar-search");
if (searchInput) {
  const container = document.createElement("div");
  container.id = "search-results";
  container.style.cssText = `
    position: absolute;
    top: 56px;
    left: 10px;
    right: 10px;
    background: #1e1e1e;
    z-index: 999;
    border-radius: 8px;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(container);

  // Dinle ve render et
  searchInput.addEventListener("input", debounce(async (e) => {
    const term = e.target.value.trim().toLowerCase();
    if (term.length >= 2) {
      const results = await searchUsers(term);
      renderResults(results);
    } else {
      renderResults([]);
    }
  }));
}
