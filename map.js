/* map.js – tüm harita mantığı */
import { watchAuthState }  from "./auth.js";
import { getUserProfile }  from "./firebase.js";

/* -------------------------------------------------- */
/* 0. Yardımcı: Aktif kullanıcıları Firestore’dan çek  */
/* -------------------------------------------------- */
async function fetchActiveUsers() {
  // <<< Firestore sorgusuyla değiştirilebilir >>>
  return [
    {uid:"2",name:"Bora",photo:"https://i.pravatar.cc/64?img=5",lat:38.43,lng:27.13},
    {uid:"3",name:"Ceyda",photo:"https://i.pravatar.cc/64?img=12",lat:38.42,lng:27.15}
  ];
}

/* -------------------------------------------------- */
/* 1. Haritayı başlat                                */
/* -------------------------------------------------- */
let map, darkTile, lightTile, meMarker;
let showMe = true;   // konum görünürlüğü
let dark   = true;   // karanlık katman aktif

window.addEventListener("DOMContentLoaded", async () => {

  map = L.map("map", {zoomControl:false, attributionControl:false})
          .setView([38.4237, 27.1428], 13);

  /* Karanlık & aydınlık katmanlar */
  darkTile  = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:19});
  lightTile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19});
  darkTile.addTo(map);

  addUiControls();
  locateMe();          // konum izni al & işaretle
  renderActiveUsers(); // diğer kullanıcı pin’lerini ekle
});

/* -------------------------------------------------- */
/* 2. UI Kontrolleri                                  */
/* -------------------------------------------------- */
function addUiControls(){
  /* Sağ üst – konum gizle/göster */
  const locBtn = L.control({position:"topright"});
  locBtn.onAdd = ()=> {
    const b = L.DomUtil.create("button","leaflet-bar");
    b.innerHTML = "📍";
    b.title="Konum göster/gizle";
    b.style.background="#1e1e1e";b.style.color="#fff";b.style.width="34px";b.style.height="34px";
    b.onclick = ()=> {
      showMe = !showMe;
      if(showMe){ if(meMarker) meMarker.addTo(map); }
      else{ if(meMarker) map.removeLayer(meMarker); }
    };
    return b;
  };
  locBtn.addTo(map);

  /* Sol üst – dark / light toggle */
  const themeBtn = L.control({position:"topleft"});
  themeBtn.onAdd = ()=> {
    const b = L.DomUtil.create("button","leaflet-bar");
    b.innerHTML = "🌓";
    b.title="Tema değiştir";
    b.style.background="#1e1e1e";b.style.color="#fff";b.style.width="34px";b.style.height="34px";
    b.onclick = ()=> {
      dark = !dark;
      if(dark){ map.removeLayer(lightTile); darkTile.addTo(map); }
      else    { map.removeLayer(darkTile);  lightTile.addTo(map); }
    };
    return b;
  };
  themeBtn.addTo(map);
}

/* -------------------------------------------------- */
/* 3. Kendi konumum                                  */
/* -------------------------------------------------- */
async function locateMe(){
  if(!navigator.geolocation){ alert("Konum desteklenmiyor"); return; }

  navigator.geolocation.getCurrentPosition(async pos=>{
    const {latitude, longitude} = pos.coords;
    map.setView([latitude, longitude], 15);

    /* Profil fotoğrafımı al */
    let myPhoto = "https://via.placeholder.com/64";
    let uid     = null;

    await watchAuthState(async user=>{
      if(user){
        uid = user.uid;
        const prof = await getUserProfile(uid);
        if(prof?.photoURL) myPhoto = prof.photoURL;
      }
    });

    const myIcon = L.divIcon({
      html:`<div class="avatar-pin"><img src="${myPhoto}"/></div>`,
      className:"",
      iconSize:[48,48],
      iconAnchor:[24,24]
    });

    meMarker = L.marker([latitude, longitude],{icon:myIcon}).addTo(map)
                .bindPopup("<b>Ben</b>");

  }, err=> alert("Konum alınamadı: "+err.message),
  {enableHighAccuracy:true});
}

/* -------------------------------------------------- */
/* 4. Diğer kullanıcılar                              */
/* -------------------------------------------------- */
async function renderActiveUsers(){
  const users = await fetchActiveUsers();
  users.forEach(u=>{
    const icon = L.divIcon({
      html:`<div class="avatar-pin small"><img src="${u.photo}"/></div>`,
      className:"",
      iconSize:[40,40],
      iconAnchor:[20,20]
    });

    const m = L.marker([u.lat, u.lng],{icon}).addTo(map);

    const popup = `
      <div style="text-align:center;min-width:140px">
        <img src="${u.photo}" style="width:48px;height:48px;border-radius:50%"><br>
        <strong>${u.name}</strong><br><br>
        <button onclick="messageUser('${u.uid}')">Mesaj Gönder</button><br>
        <button onclick="toggleFollow('${u.uid}')">Takip Et / Çıkar</button><br>
        <button onclick="viewProfile('${u.uid}')">Profili Gör</button>
      </div>`;
    m.bindPopup(popup);
  });
}

/* -------------------------------------------------- */
/* 5. Popup eylemleri (demo)                          */
/* -------------------------------------------------- */
window.messageUser = uid => alert("Mesaj ekranı: "+uid);
window.toggleFollow = uid => alert("Takip toggle: "+uid);
window.viewProfile = uid => location.href = `/profile.html?uid=${uid}`;