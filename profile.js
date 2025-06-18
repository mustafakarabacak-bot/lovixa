import { watchAuthState } from "./auth.js";
import {
  uploadImage,
  saveUserProfile,
  getUserProfile
} from "./firebase.js";

/* ---------- ELEMENTLER ---------- */
const avatarWrapper   = document.getElementById("avatar");
const avatarImg       = avatarWrapper.querySelector("img");
const addIcon         = avatarWrapper.querySelector(".add");
const avatarMenu      = document.getElementById("avatar-menu");
const changePhotoBtn  = document.getElementById("change-photo");
const addStoryBtn     = document.getElementById("add-story");
const fileInput       = document.getElementById("file-input");

const followersElm    = document.getElementById("followers");
const followingElm    = document.getElementById("following");
const followModal     = document.getElementById("follow-modal");
const followTitle     = document.getElementById("follow-title");
const followListElm   = document.getElementById("follow-list");

const gridElm         = document.getElementById("photo-grid");

let currentUser = null;
let profile = {
  photoURL: "",
  bio: "",
  followers: [],
  following: [],
  photos: []
};

/* ---------- UI YANSIT ---------- */
function renderProfile() {
  avatarImg.src = profile.photoURL || "https://via.placeholder.com/300x300?text=Profil";
  document.getElementById("bio").textContent = profile.bio || "";
  followersElm.querySelector("span").textContent = profile.followers.length || 0;
  followingElm.querySelector("span").textContent = profile.following.length || 0;
  renderGrid();
}

function renderGrid() {
  gridElm.innerHTML = "";
  if (!profile.photos || profile.photos.length === 0) {
    const empty = document.createElement("div");
    empty.className = "grid-item empty";
    empty.innerHTML = `<i class="ph-plus-bold"></i>`;
    empty.addEventListener("click", () => fileInput.click());
    gridElm.appendChild(empty);
  } else {
    profile.photos.forEach(p => {
      const it = document.createElement("div");
      it.className = "grid-item";
      it.innerHTML = `<img src="${p.url}" alt="photo">`;
      it.addEventListener("click", () => openFullscreen(p.url));
      gridElm.appendChild(it);
    });
  }
}

/* ---------- ETKİLEŞİM ---------- */
let pressTimer;
avatarWrapper.addEventListener("mousedown", startPress);
avatarWrapper.addEventListener("touchstart", startPress);
avatarWrapper.addEventListener("mouseup", cancelPress);
avatarWrapper.addEventListener("mouseleave", cancelPress);
avatarWrapper.addEventListener("touchend", cancelPress);

function startPress() {
  cancelPress();
  pressTimer = setTimeout(() => avatarMenu.classList.add("active"), 600);
}
function cancelPress() {
  clearTimeout(pressTimer);
}

[avatarMenu, followModal].forEach(m => m.addEventListener("click", e => {
  if (e.target === m) m.classList.remove("active");
}));

changePhotoBtn.onclick = () => fileInput.click();

fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file || !currentUser) return;

  try {
    const path = `users/${currentUser.uid}/profile.jpg`;
    const url = await uploadImage(file, path);
    profile.photoURL = url;
    avatarWrapper.classList.remove("story");

    await saveUserProfile(currentUser.uid, profile);
    renderProfile();
  } catch (err) {
    alert("Fotoğraf yüklenirken hata oluştu.");
    console.error(err);
  }
};

addStoryBtn.onclick = () => {
  avatarWrapper.classList.add("story");
  avatarMenu.classList.remove("active");
  // Hikaye ekleme Firebase'e entegre edilecek
};

/* ---------- TAKİP LİSTESİ ---------- */
followersElm.onclick = () => openFollowModal("Takipçiler", profile.followers);
followingElm.onclick = () => openFollowModal("Takip", profile.following);

function openFollowModal(title, list) {
  followTitle.textContent = title;
  followListElm.innerHTML = "";
  list.forEach(u => {
    const row = document.createElement("div");
    row.className = "follow-row";
    row.innerHTML = `
      <img src="${u.photo}" alt="${u.name}">
      <span>${u.name}</span>
      <button class="${u.isFollowing ? 'alt' : ''}">
        ${u.isFollowing ? 'Takipten Çıkar' : 'Takip Et'}
      </button>`;
    row.querySelector("button").onclick = () => toggleFollow(u);
    row.onclick = e => { if (e.target.tagName !== "BUTTON") openUserProfile(u.uid); };
    followListElm.appendChild(row);
  });
  followModal.classList.add("active");
}

function toggleFollow(u) {
  u.isFollowing = !u.isFollowing;
  renderProfile();
  openFollowModal(followTitle.textContent,
    followTitle.textContent === "Takipçiler" ? profile.followers : profile.following);
}

function openUserProfile(uid) {
  alert("Başka kullanıcının profili: " + uid);
}

/* ---------- GÖRSEL TAM EKRAN ---------- */
function openFullscreen(url) {
  const m = document.createElement("div");
  m.className = "modal active";
  m.innerHTML = `<img src="${url}" style="max-height:90vh;border-radius:var(--radius)">`;
  m.onclick = () => document.body.removeChild(m);
  document.body.appendChild(m);
}

/* ---------- GİRİŞ KONTROLÜ + VERİ YÜKLEME ---------- */
watchAuthState(async user => {
  if (!user) {
    window.location.href = "/login.html";
  } else {
    currentUser = user;
    const data = await getUserProfile(user.uid);
    profile = data || {
      photoURL: "",
      bio: "",
      followers: [],
      following: [],
      photos: []
    };
    renderProfile();
  }
});