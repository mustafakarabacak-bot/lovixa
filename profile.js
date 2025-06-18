// profile.js  –  type="module"
// Varsayılan ES Modül yapısı → PWA & Tree-Shaking uyumlu
import { watchAuthState, logout } from "./auth.js"; // gereksizse kaldırılır
// import { uploadImage, fetchProfileData, fetchFollowers } from "./api.js"; // örnek

/* ---------- ELEMAN REFERANSLARI ---------- */
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

/* ---------- DUMMY DATA (demo) ---------- */
let profile = {
  photoURL: "https://via.placeholder.com/300x300?text=Profil",
  bio: "Merhaba! Kendi biyografini buraya yaz.",
  followers: [{uid:"1",name:"Ada",photo:"https://i.pravatar.cc/46?img=12",isFollowing:true}],
  following: [{uid:"2",name:"Bora",photo:"https://i.pravatar.cc/46?img=5",isFollowing:true}],
  photos   : [] // {url:"",id:""} max 9
};

/* ---------- UI BAĞLANTILARI ---------- */
// profil fotoğrafını & sayıyı ekranda güncelle
function renderProfile(){
  avatarImg.src = profile.photoURL;
  document.getElementById("bio").textContent = profile.bio;
  followersElm.querySelector("span").textContent = profile.followers.length;
  followingElm.querySelector("span").textContent = profile.following.length;
  renderGrid();
}

// grid oluştur
function renderGrid(){
  gridElm.innerHTML = "";
  if(profile.photos.length === 0){
    const empty = document.createElement("div");
    empty.className = "grid-item empty";
    empty.innerHTML = `<i class="ph-plus-bold"></i>`;
    empty.addEventListener("click",()=> fileInput.click());
    gridElm.appendChild(empty);
  }else{
    profile.photos.forEach(p=>{
      const it=document.createElement("div");
      it.className="grid-item";
      it.innerHTML=`<img src="${p.url}" alt="photo">`;
      it.addEventListener("click",()=> openFullscreen(p.url));
      gridElm.appendChild(it);
    });
  }
}

/* ---------- EVENTLER ---------- */
// Profil fotoğrafına uzun basınca menüyü aç
let pressTimer;
avatarWrapper.addEventListener("mousedown",startPress);
avatarWrapper.addEventListener("touchstart",startPress);
avatarWrapper.addEventListener("mouseup",cancelPress);
avatarWrapper.addEventListener("mouseleave",cancelPress);
avatarWrapper.addEventListener("touchend",cancelPress);

function startPress(e){
  cancelPress();
  pressTimer = setTimeout(()=> avatarMenu.classList.add("active"),600);
}
function cancelPress(){
  clearTimeout(pressTimer);
}

// Modal kapama
[avatarMenu,followModal].forEach(m=> m.addEventListener("click",e=>{
  if(e.target===m) m.classList.remove("active");
}));

// Fotoğraf güncelle
changePhotoBtn.onclick = ()=> fileInput.click();
fileInput.onchange = async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const url = URL.createObjectURL(file); // demo; prod’da storage URL’i
  profile.photoURL = url;
  avatarWrapper.classList.remove("story");
  renderProfile();
  // await uploadImage(file,"profilePhoto"); // gerçek yükleme
};

// Hikayeye ekle → renkli çerçeve
addStoryBtn.onclick = ()=>{
  avatarWrapper.classList.add("story");
  avatarMenu.classList.remove("active");
  // Story datasını database’e kaydet …
};

// Takipçi / Takip listesi
followersElm.onclick = ()=> openFollowModal("Takipçiler",profile.followers);
followingElm.onclick = ()=> openFollowModal("Takip",profile.following);

function openFollowModal(title,list){
  followTitle.textContent = title;
  followListElm.innerHTML = "";
  list.forEach(u=>{
    const row=document.createElement("div");
    row.className="follow-row";
    row.innerHTML=`
      <img src="${u.photo}" alt="${u.name}">
      <span>${u.name}</span>
      <button class="${u.isFollowing?'alt':''}">
        ${u.isFollowing?'Takipten Çıkar':'Takip Et'}
      </button>`;
    row.querySelector("button").onclick=()=>toggleFollow(u);
    row.onclick= e=>{ if(e.target.tagName!=="BUTTON") openUserProfile(u.uid); };
    followListElm.appendChild(row);
  });
  followModal.classList.add("active");
}

function toggleFollow(u){
  u.isFollowing = !u.isFollowing;
  renderProfile();
  openFollowModal(followTitle.textContent,
                  followTitle.textContent==="Takipçiler"?profile.followers:profile.following);
}

function openUserProfile(uid){
  // window.location.href=`/profile.html?uid=${uid}`;
  alert("Başka kullanıcının profili: "+uid);
}

/* ---------- FULLSCREEN GÖSTERİCİ (basit) ---------- */
function openFullscreen(url){
  const m=document.createElement("div");
  m.className="modal active";
  m.innerHTML=`<img src="${url}" style="max-height:90vh;border-radius:var(--radius)">`;
  m.onclick=()=>document.body.removeChild(m);
  document.body.appendChild(m);
}

/* ---------- AUTH GUARD (opsiyonel) ---------- */
watchAuthState(user=>{
  if(!user){
    // window.location.href="/login.html";
    console.log("Anonim kullanıcı – yönlendir");
  }else{
    // profile = await fetchProfileData(user.uid);
    renderProfile();
  }
});

/* Demo init */
renderProfile();