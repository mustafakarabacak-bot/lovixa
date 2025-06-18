// ui-events.js
import { watchAuthState } from "./auth.js";
import { getUserProfile } from "./firebase.js";

// Topbar: arama ve mesaj yönlendirme
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const drop = document.getElementById("search-drop");

  if (searchInput) {
    searchInput.oninput = async e => {
      const q = e.target.value.trim();
      if (!q) return (drop.style.display = "none");

      // MOCK veriler – Firestore ile değiştir
      const results = [
        { uid: "1", name: "Ada", photo: "https://i.pravatar.cc/36?img=12", isFollowing: false },
        { uid: "2", name: "Bora", photo: "https://i.pravatar.cc/36?img=5", isFollowing: true }
      ].filter(u => u.name.toLowerCase().includes(q.toLowerCase()));

      drop.innerHTML = "";
      results.forEach(u => {
        const r = document.createElement("div");
        r.className = "result-row";
        r.innerHTML = `<img src="${u.photo}"><span>${u.name}</span>
          <button>${u.isFollowing ? "Takipten Çıkar" : "Takip Et"}</button>`;
        r.onclick = () => window.location.href = `/profile.html?uid=${u.uid}`;
        r.querySelector("button").onclick = ev => {
          ev.stopPropagation();
          alert("Takip durumu güncellendi.");
        };
        drop.appendChild(r);
      });
      drop.style.display = "block";
    };
  }

  const msgBtn = document.getElementById("msg-btn");
  if (msgBtn) msgBtn.onclick = () => window.location.href = "/messages.html";

  // Bottom-nav: aktif sayfa vurgusu
  const path = location.pathname.split("/").pop();
  document.querySelectorAll(".bottom-nav a").forEach(a => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });

  // Plus menü toggle
  const plusBtn = document.getElementById("plus-btn");
  const plusMenu = document.getElementById("plus-menu");
  if (plusBtn && plusMenu) {
    plusBtn.onclick = () => {
      plusMenu.style.display = plusMenu.style.display === "flex" ? "none" : "flex";
    };
    window.addEventListener("click", e => {
      if (e.target !== plusBtn && !plusMenu.contains(e.target)) plusMenu.style.display = "none";
    });
    document.getElementById("story-btn").onclick = () => alert("Hikâye ekleme açılacak.");
    document.getElementById("photo-btn").onclick = () => alert("Fotoğraf paylaşma açılacak.");
  }

  // Kullanıcı fotoğrafları (üst bar + alt nav)
  watchAuthState(async user => {
    if (!user) return;
    const prof = await getUserProfile(user.uid);
    if (prof?.photoURL) {
      const topAvatar = document.getElementById("avatar-top");
      const navAvatar = document.getElementById("nav-avatar");
      if (topAvatar) topAvatar.src = prof.photoURL;
      if (navAvatar) navAvatar.src = prof.photoURL;
    }
  });
});