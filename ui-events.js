import { watchAuthState } from "./auth.js";
import { getUserProfile } from "./firebase.js";

// Aktif menüyü vurgula
const path = location.pathname.split("/").pop();
document.querySelectorAll(".bottom-nav a").forEach(a => {
  if (a.getAttribute("href") === path) a.classList.add("active");
});

// Profil resmini yükle
watchAuthState(async user => {
  if (!user) return;
  const prof = await getUserProfile(user.uid);
  if (prof?.photoURL) {
    const avatar = document.getElementById("nav-avatar");
    if (avatar) avatar.src = prof.photoURL;
  }
});

// Plus menü toggle
const plusBtn = document.getElementById("plus-btn");
const plusMenu = document.getElementById("plus-menu");

if (plusBtn && plusMenu) {
  plusBtn.onclick = () => {
    plusMenu.style.display = plusMenu.style.display === "flex" ? "none" : "flex";
  };

  window.addEventListener("click", e => {
    if (e.target !== plusBtn && !plusMenu.contains(e.target)) {
      plusMenu.style.display = "none";
    }
  });

  document.getElementById("story-btn").onclick = () => alert("Hikâye Ekle Açılacak");
  document.getElementById("photo-btn").onclick = () => alert("Fotoğraf Paylaş Açılacak");
}