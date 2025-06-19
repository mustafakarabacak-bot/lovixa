// /scripts/map.js  |  Lovixa Real-Time Google Maps Integration – v2025-06-20
// ===============================================================
// ✨ Revision summary
// 1. Siyah daire sorunu giderildi (asenkron ikon güncelleme)
// 2. Yenileme sonrası harita yüklenmeme sorunu çözüldü
// 3. Özel Lovixa pop-up tasarımı + Takip / Takipten Çık + Hikaye + Mesaj
// 4. Bloklama mantığı düzeltildi (çift yönlü kontrol eklendi)
// 5. Markır kaldırma mantığı iyileştirildi
// ---------------------------------------------------------------
import { db, auth } from "./firebase.js";
import {
  doc, setDoc, updateDoc, serverTimestamp,
  collection, onSnapshot, arrayUnion, arrayRemove, getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// ---------- Global State ----------
let map, authUser, userMarker;
const markers   = new Map();           // uid → { marker, data }
let showMyLoc   = true;
let darkMode    = true;
let currentUserBlocked = [];           // Mevcut kullanıcının engelledikleri
const UPDATE_MS = 5_000;
const EXPIRE_MS = 30_000;

const MAP_ID_DARK  = "DEMO_DARK";
const MAP_ID_LIGHT = "DEMO_LIGHT";

// ----------- Bootstrap ----------
(function bootstrap(){
  if (window.google?.maps) initMap();
  else window.initMap = initMap;
})();

// ---------- Google callback ----------
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) { console.error("#map bulunamadı"); return; }

  mapEl.style.minHeight = "calc(100vh - 120px)";
  Object.assign(mapEl.style,{ margin:"0", borderRadius:"0", overflow:"hidden" });

  map = new google.maps.Map(mapEl,{
    center:{ lat:41.015137, lng:28.97953 },
    zoom:12,
    mapId:MAP_ID_DARK,
    disableDefaultUI:true,
    gestureHandling:"greedy",
    padding:{ top:60, right:12, bottom:60, left:12 }
  });

  window.map = map;            // dış modüller için
  renderControlIcons();
  startRealtimeFlow();
}

// ---------- Firebase flow ----------
function startRealtimeFlow(){
  onAuthStateChanged(auth,async u=>{
    if(!u) return;
    authUser=u;
    
    // Bloklanan kullanıcıları yükle
    const userDoc = await getDoc(doc(db,"users",authUser.uid));
    currentUserBlocked = userDoc.data()?.blocked || [];
    
    // Blok listesi dinleyicisi
    onSnapshot(doc(db,"users",authUser.uid),snap=>{
      if(snap.exists()) {
        currentUserBlocked = snap.data().blocked || [];
        // Engellenen kullanıcıların markırlarını kaldır
        markers.forEach((_,uid)=>{
          if(currentUserBlocked.includes(uid)) removeMarker(uid);
        });
      }
    });
    
    liveLocationUpdater();
    listenUsers();
  });
}

// 1️⃣ Kendi konumunu periyodik güncelle
function liveLocationUpdater(){
  if(!navigator.geolocation) return;
  const selfRef = doc(db,"users",authUser.uid);
  let first=true;

  const push = ()=>{
    navigator.geolocation.getCurrentPosition(async p=>{
      const { latitude:lat, longitude:lng } = p.coords;
      await setDoc(selfRef,{
        lat,lng,
        lastSeen:serverTimestamp(),
        isVisible:showMyLoc,
        photo:authUser.photoURL||"",
        username:authUser.displayName||""
      },{ merge:true });
      await placeSelfMarker({lat,lng},first);
      first=false;
    });
  };
  push(); setInterval(push,UPDATE_MS);
}

// 2️⃣ Diğer kullanıcıları dinle
function listenUsers(){
  onSnapshot(collection(db,"users"),snap=>{
    const now=Date.now();
    snap.forEach(ds=>{
      const uid=ds.id;
      if(uid===authUser.uid) return;

      const d=ds.data();
      const blockedMe = d.blocked?.includes(authUser.uid);
      const iBlocked  = currentUserBlocked.includes(uid);
      const invisible = d.isVisible===false;
      const expired   = !d.lastSeen || now-d.lastSeen.toMillis()>EXPIRE_MS;

      if(blockedMe || iBlocked || invisible || expired){
        removeMarker(uid);
        return;
      }

      const pos={ lat:d.lat, lng:d.lng };
      if(!markers.has(uid)){
        markers.set(uid,makeFriendMarker(uid,d,pos));
      }else{
        markers.get(uid).marker.setPosition(pos);
      }
    });
  });
}

// Markır kaldırma yardımcısı
function removeMarker(uid){
  const markerData = markers.get(uid);
  if(!markerData) return;
  markerData.marker.setMap(null);
  markers.delete(uid);
}

// ---------- Marker helpers ----------
async function placeSelfMarker(position,pan){
  if(userMarker) userMarker.setMap(null);
  const icon=await circularImage(authUser.photoURL,96,"#4caf50");
  userMarker=new google.maps.Marker({
    position,map,
    icon:{ url:icon, scaledSize:new google.maps.Size(48,48) },
    zIndex:999
  });
  userMarker.setVisible(showMyLoc);
  if(pan) map.panTo(position);
}

function makeFriendMarker(uid,data,pos){
  const placeholder=placeholderCircle(80,"#4285f4");
  const marker=new google.maps.Marker({
    position:pos, map,
    icon:{ url:placeholder, scaledSize:new google.maps.Size(40,40) },
    title:data.username||"User"
  });
  circularImage(data.photo,80,"#4285f4")
    .then(url=>marker.setIcon({ url, scaledSize:new google.maps.Size(40,40) }))
    .catch(console.warn);

  marker.addListener("click",()=>openPopup(uid));
  return { marker, data };
}

// ---------- Popup ----------
let popupWindow;

function openPopup(uid){
  const { data, marker } = markers.get(uid);
  const followers=data.followers||[];
  const iFollow=followers.includes(authUser.uid);

  const html=/*html*/`
  <div class="lx-pop">
    <div class="lx-row">
      <img src="${data.photo||''}" class="lx-avatar"
           onclick="location.href='/profile.html?uid=${uid}'">
      <div class="lx-user">
        <b onclick="location.href='/profile.html?uid=${uid}'">${data.username||'Kullanıcı'}</b><br>
        <small id="fcount-${uid}">Takipçi: ${followers.length}</small><br>
        <small>Son görülme: ${timeAgo(data.lastSeen?.toDate())}</small>
      </div>
    </div><hr>
    <button class="lx-btn" onclick="toggleFollow('${uid}')">
      <i class="fas ${iFollow?'fa-user-minus':'fa-user-plus'}"></i>
      <span id="fbtn-${uid}">${iFollow?'Takipten Çık':'Takip Et'}</span>
    </button>
    <button class="lx-btn" onclick="location.href='/messages.html?uid=${uid}'">
      <i class="fas fa-paper-plane"></i> Mesaj
    </button>
    <button class="lx-btn" onclick="location.href='/story.html?uid=${uid}'">
      <i class="fas fa-circle-play"></i> Hikayeyi Gör
    </button>
    <button class="lx-btn red" onclick="blockUser('${uid}')">
      <i class="fas fa-ban"></i> Engelle
    </button>
  </div>

  <style>
    .lx-pop{width:240px;background:#1e1e1e;color:#fff;padding:12px;border-radius:12px;font-family:Segoe UI}
    .lx-row{display:flex;gap:12px;align-items:center}
    .lx-avatar{width:52px;height:52px;border-radius:50%;object-fit:cover;cursor:pointer}
    .lx-user b{cursor:pointer}
    .lx-btn{width:100%;margin:4px 0;padding:6px;border:none;border-radius:8px;
            background:#2a2a2a;color:#fff;cursor:pointer;display:flex;gap:8px;align-items:center;justify-content:center}
    .lx-btn.red{background:#c62828}
    .lx-btn i{font-size:14px}
    hr{border:0;border-top:1px solid #333;margin:8px 0}
  </style>`;

  popupWindow?.close();
  popupWindow=new google.maps.InfoWindow({ content:html });
  popupWindow.open(map,marker);
}

window.toggleFollow = async uid=>{
  const ref=doc(db,"users",uid);
  const snap=await getDoc(ref);
  const followers=snap.data()?.followers||[];
  const isFollowing=followers.includes(authUser.uid);

  await updateDoc(ref,{
    followers:isFollowing?arrayRemove(authUser.uid):arrayUnion(authUser.uid)
  });

  // UI anında güncelle
  const btn=document.getElementById(`fbtn-${uid}`);
  const fcnt=document.getElementById(`fcount-${uid}`);
  if(btn&&fcnt){
    const newCount=isFollowing?followers.length-1:followers.length+1;
    btn.textContent=isFollowing?"Takip Et":"Takipten Çık";
    btn.previousElementSibling.className=`fas ${isFollowing?'fa-user-plus':'fa-user-minus'}`;
    fcnt.textContent=`Takipçi: ${newCount}`;
  }
};

window.blockUser = async uid=>{
  await updateDoc(doc(db,"users",authUser.uid),{ blocked:arrayUnion(uid) });
  removeMarker(uid); // Markırı anında kaldır
};

// ---------- Control icons ----------
function renderControlIcons(){
  floatingBtn("fa-location-crosshairs","left","12px",function(){
    showMyLoc=!showMyLoc;
    updateDoc(doc(db,"users",authUser.uid),{ isVisible:showMyLoc });
    userMarker?.setVisible(showMyLoc);
  });
  floatingBtn(darkMode?"fa-moon":"fa-sun","right","12px",function(){
    darkMode=!darkMode;
    map.setMapId(darkMode?MAP_ID_DARK:MAP_ID_LIGHT);
    this.querySelector("i").className=`fas ${darkMode?'fa-moon':'fa-sun'}`;
  });
}

function floatingBtn(icon,side,x,cb){
  const d=document.createElement("div");
  d.innerHTML=`<i class="fas ${icon}"></i>`;
  Object.assign(d.style,{
    position:"absolute",[side]:x,bottom:"88px",
    background:"#1e1e1e",color:"#fff",
    width:"44px",height:"44px",borderRadius:"50%",
    display:"flex",alignItems:"center",justifyContent:"center",
    cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,.5)",
    zIndex:1000,fontSize:"18px"
  });
  d.onclick=cb;
  document.body.appendChild(d);
}

// ---------- Visual helpers ----------
function placeholderCircle(size,border){
  const c=document.createElement("canvas"); c.width=c.height=size;
  const x=c.getContext("2d");
  x.fillStyle="#444";
  x.beginPath(); x.arc(size/2,size/2,size/2,0,Math.PI*2); x.fill();
  if(border){ x.lineWidth=3; x.strokeStyle=border;
    x.beginPath(); x.arc(size/2,size/2,size/2-1,0,Math.PI*2); x.stroke(); }
  return c.toDataURL();
}

function circularImage(src,size=96,border="#fff"){
  return new Promise(res=>{
    const c=document.createElement("canvas"); c.width=c.height=size;
    const x=c.getContext("2d");
    const img=new Image(); img.crossOrigin="anonymous"; img.src=src||"";
    img.onload=()=>{ draw(); res(c.toDataURL()); };
    img.onerror=()=>res(placeholderCircle(size,border));
    function draw(){
      x.save(); x.beginPath(); x.arc(size/2,size/2,size/2,0,Math.PI*2); x.clip();
      x.drawImage(img,0,0,size,size); x.restore();
      if(border){ x.lineWidth=4; x.strokeStyle=border;
        x.beginPath(); x.arc(size/2,size/2,size/2-2,0,Math.PI*2); x.stroke();}
    }
  });
}

const timeAgo=d=>!d?"?":`${Math.floor((Date.now()-d.getTime())/60000)} dk önce`;
