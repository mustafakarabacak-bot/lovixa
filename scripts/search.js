/* /scripts/search.js  – Lovixa Next-Gen User Search */

import { db } from "./firebase.js";
import {
  collection, query, where, orderBy,
  startAt, endAt, getDocs, limit
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

/* ───────────────────────────────── Debounce */
const debounce = (fn, delay = 300) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); };
};

/* ───────────────────────────────── Firestore Lookup */
async function searchUsers(term) {
  if (!term) return [];

  const usersRef = collection(db, "users");

  // Varsayılan: case-insensitive => usernameLower (önerilen ek alan)
  const q = query(
    usersRef,
    orderBy("usernameLower"),
    startAt(term),
    endAt(term + "\uf8ff"),
    limit(20)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ───────────────────────────────── UI Render */
function renderResults(list) {
  results.innerHTML = "";

  if (!list.length) {
    results.innerHTML = `<div class="no-res">Sonuç yok</div>`;
    return;
  }

  list.forEach(u => {
    const row = document.createElement("div");
    row.className = "res-row";
    row.innerHTML = `
      <img src="${u.photoURL || 'https://via.placeholder.com/40'}" />
      <span>${u.username || u.email}</span>
    `;
    row.onclick = () => {
      // TODO: Profil modal / yönlendirme
      location.href = `/profile?id=${u.id}`;
    };
    results.appendChild(row);
  });
}

/* ───────────────────────────────── DOM Bind */
const input   = document.getElementById("user-search");   // ID eşleşmesi düzeltildi
const results = document.createElement("div");
results.id = "search-results";
results.style.cssText = `
  position: absolute; top: var(--top-h); left: 8px; right: 8px;
  background: #1e1e1e; border-radius: 8px; max-height: 300px;
  overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,.3); z-index: 999;
`;
document.body.appendChild(results);

/* Stil – kurumsal tutarlılık */
const style = document.createElement("style");
style.textContent = `
  #search-results .res-row{display:flex;align-items:center;padding:8px 12px;
    gap:10px;cursor:pointer;border-bottom:1px solid #333;}
  #search-results .res-row:hover{background:#2a2a2a;}
  #search-results img{width:32px;height:32px;border-radius:50%;}
  #search-results .no-res{padding:8px 12px;color:gray;}
`;
document.head.appendChild(style);

/* ───────────────────────────────── Events */
if (input) {
  input.addEventListener("input", debounce(async e => {
    const term = e.target.value.trim().toLowerCase();
    term.length >= 2 ? renderResults(await searchUsers(term)) : results.innerHTML = "";
  }));

  /* Dış tıkta kapat */
  document.addEventListener("click", e => {
    if (!results.contains(e.target) && e.target !== input) results.innerHTML = "";
  });
}

export { searchUsers };            // İleride test & yeniden kullanım için