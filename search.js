// search.js
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);
const input = document.getElementById("search-input");
const drop = document.getElementById("search-drop");

input.addEventListener("input", async (e) => {
  const term = e.target.value.trim().toLowerCase();
  if (!term) return (drop.style.display = "none");

  const q = query(
    collection(db, "users"),
    where("keywords", "array-contains", term) // arama için optimize field
  );

  const snapshot = await getDocs(q);
  drop.innerHTML = "";

  snapshot.forEach(doc => {
    const user = doc.data();
    const row = document.createElement("div");
    row.className = "result-row";
    row.innerHTML = `
      <img src="${user.photoURL || 'https://via.placeholder.com/36'}">
      <span>${user.name || 'Kullanıcı'}</span>
      <button>Takip Et</button>
    `;
    row.onclick = () => location.href = `/profile.html?uid=${doc.id}`;
    row.querySelector("button").onclick = ev => {
      ev.stopPropagation();
      alert(`Takip isteği: ${doc.id}`);
    };
    drop.appendChild(row);
  });

  drop.style.display = "block";
});

// dışa tıklanınca kapan
window.addEventListener("click", (e) => {
  if (!input.contains(e.target) && !drop.contains(e.target)) {
    drop.style.display = "none";
  }
});

// avatar & mesaj tıklama
document.getElementById("msg-btn").onclick = () => location.href = "/messages.html";