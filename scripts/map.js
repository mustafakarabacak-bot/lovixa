// /scripts/map.js  |  Lovixa Real-Time Google Maps Integration – FINAL
// -------------------------------------------------
import { db, auth } from "./firebase.js";
import {
  doc, setDoc, updateDoc, serverTimestamp,
  collection, onSnapshot, arrayUnion, arrayRemove, getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// ---------- Küresel durum ----------
let map, authUser, userMarker;
const markers   = new Map();     // uid → { marker, data }
let showMyLoc   = true;
let darkMode    = true;
const UPDATE_MS = 5000;
const EXPIRE_MS = 30_000;        // 30 sn

const MAP_ID_DARK  = "DEMO_DARK";
const MAP_ID_LIGHT = "DEMO_LIGHT";

// ---------- Google callback ----------
window.initMap = () => {
  const mapEl = document.getElementById("map");
  Object.assign(mapEl.style, { margin:"12px", borderRadius:"16px", overflow:"hidden" });

  map = new google.maps.Map(mapEl, {
    center: { lat: 41.015137, lng: 28.97953 },
    zoom: 12,
    mapId: MAP_ID_DARK,
    disableDefaultUI: true,
    gestureHandling: "greedy",
    padding: { top: 60, right: 12, bottom: 60, left: 12 }
  });

  renderControlIcons();
  startRealtimeFlow();
};

// ---------- Firebase akışı ----------
function startRealtimeFlow() {
  onAuthStateChanged(auth, (u) => {
    if (!u) return;
    authUser = u;
    liveLocationUpdater();
    listenUsers();            // tüm kullanıcıları dinle
  });
}

// 1️⃣ Konumunu 5 sn’de bir güncelle (ilk panTo sadece ilk çağrıda)
function liveLocationUpdater() {
  if (!navigator.geolocation) return;
  const selfRef = doc(db, "users", authUser.uid);
  let first = true;
  const push = () => {
    navigator.geolocation.getCurrentPosition(async p => {
      const { latitude:lat, longitude:lng } = p.coords;
      await setDoc(selfRef, {
        lat, lng,
        lastSeen : serverTimestamp(),
        isVisible: showMyLoc,
        photo    : authUser.photoURL || "",
        username : authUser.displayName || ""
      }, { merge:true });
      await placeSelfMarker({ lat,lng }, first);
      first = false;
    });
  };
  push();
  setInterval(push, UPDATE_MS);
}

// 2️⃣ Diğer kullanıcıları dinle (lastSeen / engelle / görünürlük filtreleri)
function listenUsers() {
  onSnapshot(collection(db,"users"), snap => {
    const now = Date.now();
    snap.forEach(docSnap => {
      const uid = docSnap.id;
      if(uid === authUser.uid) return; // kendi kaydım
      const d   = docSnap.data();
      // Engelle - gizle kuralları
      const blockedMe   = d.blocked?.includes(authUser.uid);
      const iBlockedHim = docSnap.data()?.blockedBy?.includes(authUser.uid); // lazımsa
      const invisible   = d.isVisible === false;
      const expired     = !d.lastSeen || now - d.lastSeen.toMillis() > EXPIRE_MS;

      if (blockedMe || invisible || expired) {
        markers.get(uid)?.marker.setMap(null);
        markers.delete(uid);
        return;
      }

      const pos = { lat:d.lat, lng:d.lng };
      if (!markers.has(uid)) {
        markers.set(uid, makeFriendMarker(uid,d,pos, iBlockedHim));
      } else {
        markers.get(uid).marker.setPosition(pos);
      }
    });
  });
}

// ---------- Marker helpers ----------
async function placeSelfMarker(position, pan) {
  if (userMarker) userMarker.setMap(null);
  const icon = await circularImage(authUser.photoURL||"",96,"#4caf50");
  userMarker = new google.maps.Marker({
    position, map,
    icon:{ url:icon, scaledSize:new google.maps.Size(48,48) },
    zIndex:999
  });
  userMarker.setVisible(showMyLoc);
  if (pan) map.panTo(position);
}

function makeFriendMarker(uid,data,pos,blur){
  const marker = new google.maps.Marker({
    position:pos, map,
    icon:{ url:circularImageSync(data.photo,80,blur?"#777":"#4285f4",blur), scaledSize:new google.maps.Size(40,40) },
    title:data.username||"User"
  });
  markers.set(uid,{ marker, data });
  marker.addListener("click", ()=> openPopup(uid));
  return { marker, data };
}

// ---------- Popup ----------
function openPopup(uid){
  const { data } = markers.get(uid);
  const followers = data.followers||[];
  const html = /*html*/`
  <div style="background:#1e1e1e;color:#fff;padding:12px;border-radius:8px;width:240px;font-family:Segoe UI">
    <div style="display:flex;align-items:center;gap:12px">
      <img src="${data.photo||''}" style="width:48px;height:48px;border-radius:50%;cursor:pointer"
           onclick="location.href='/story.html?uid=${uid}'">
      <div>
        <b>${data.username||'Kullanıcı'}</b><br>
        <small>Takipçi: ${followers.length}</small><br>
        <small>Son görülme: ${timeAgo(data.lastSeen?.toDate())}</small>
      </div>
    </div><hr style="border:0;border-top:1px solid #333;margin:8px 0">
    <button class="lx" onclick="location.href='/messages.html?uid=${uid}'"><i class="fas fa-comment"></i> Mesaj</button>
    <button class="lx" onclick="toggleFollow('${uid}')">
      <i class="fas ${followers.includes(authUser.uid)?'fa-user-minus':'fa-user-plus'}"></i>
      ${followers.includes(authUser.uid)?'Takipten Çık':'Takip Et'}
    </button>
    <button class="lx" onclick="location.href='/profile.html?uid=${uid}'"><i class="fas fa-user"></i> Profil</button>
    <button class="lx red" onclick="blockUser('${uid}')"><i class="fas fa-ban"></i> Engelle</button>
  </div>
  <style>.lx{width:100%;margin:4px 0;padding:6px;border:none;border-radius:6px;background:#2a2a2a;color:#fff;cursor:pointer}
  .lx.red{background:#c62828}</style>`;
  new google.maps.InfoWindow({ content:html }).open(map, markers.get(uid).marker);
}

window.toggleFollow = async uid=>{
  const ref=doc(db,"users",uid); const s=await getDoc(ref);
  const following=s.data()?.followers?.includes(authUser.uid);
  await updateDoc(ref,{ followers: following?arrayRemove(authUser.uid):arrayUnion(authUser.uid) });
};
window.blockUser = async uid=>{
  await updateDoc(doc(db,"users",authUser.uid),{ blocked:arrayUnion(uid) });
};

// ---------- Kontrol ikonları ----------
function renderControlIcons(){
  // Konum
  floatingBtn("fa-location-crosshairs","left","12px",()=>{
    showMyLoc=!showMyLoc;
    updateDoc(doc(db,"users",authUser.uid),{ isVisible:showMyLoc });
    userMarker?.setVisible(showMyLoc);
  });
  // Tema
  floatingBtn("fa-moon","right","12px",()=>{
    darkMode=!darkMode;
    map.setMapId(darkMode?MAP_ID_DARK:MAP_ID_LIGHT);
    this.className=`fas ${darkMode?'fa-moon':'fa-sun'}`;
  });
}
function floatingBtn(icon,side,x,cb){
  const d=document.createElement("div");
  d.innerHTML=`<i class="fas ${icon}"></i>`;
  Object.assign(d.style,{position:"absolute",[side]:x,bottom:"88px",background:"#1e1e1e",
    color:"#fff",width:"44px",height:"44px",borderRadius:"50%",display:"flex",
    alignItems:"center",justifyContent:"center",cursor:"pointer",
    boxShadow:"0 2px 6px rgba(0,0,0,.5)",zIndex:1000,fontSize:"18px"});
  d.onclick=cb; document.body.appendChild(d);
}

// ---------- Görsel yardımcıları ----------
function circularImageSync(src,size,border,blur){
  const c=document.createElement("canvas");c.width=c.height=size;const x=c.getContext("2d");
  x.fillStyle="#444";x.beginPath();x.arc(size/2,size/2,size/2,0,Math.PI*2);x.fill();
  const img=new Image();img.crossOrigin="anonymous";img.src=src||"";
  if(img.complete) draw(); else img.onload=draw;
  function draw(){
    if(blur) x.filter="blur(2px)";
    x.save();x.beginPath();x.arc(size/2,size/2,size/2,0,Math.PI*2);x.clip();
    x.drawImage(img,0,0,size,size);x.restore();
    if(border){x.lineWidth=3;x.strokeStyle=border;x.beginPath();x.arc(size/2,size/2,size/2-1,0,Math.PI*2);x.stroke();}
  }
  return c.toDataURL();
}
function circularImage(src,size=96,border="#fff"){
  return new Promise(res=>{
    const c=document.createElement("canvas");c.width=c.height=size;const x=c.getContext("2d");
    const img=new Image();img.crossOrigin="anonymous";img.src=src||"";
    img.onload=()=>{x.save();x.beginPath();x.arc(size/2,size/2,size/2,0,Math.PI*2);x.clip();
      x.drawImage(img,0,0,size,size);x.restore();
      if(border){x.lineWidth=4;x.strokeStyle=border;x.beginPath();x.arc(size/2,size/2,size/2-2,0,Math.PI*2);x.stroke();}
      res(c.toDataURL());
    };
    img.onerror=()=>res(c.toDataURL());
  });
}
const timeAgo=d=>!d?"?":`${Math.floor((Date.now()-d.getTime())/60000)} dk önce`;
