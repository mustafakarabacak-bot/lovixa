// /scripts/map.js | Lovixa Real‑Time Google Maps Integration – FINAL
import { db, auth } from "./firebase.js";
import {
  doc, setDoc, updateDoc, serverTimestamp,
  collection, onSnapshot, arrayUnion, arrayRemove, getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

let map, authUser, userMarker;
const markers = new Map();
let showLocation = true;
let darkMode = true;
const UPDATE_MS = 5000;

const MAP_ID_DARK = "DEMO_DARK";
const MAP_ID_LIGHT = "DEMO_LIGHT";

// Control Elements
let themeBtn, locationBtn;

window.initMap = async () => {
  const mapEl = document.getElementById("map");
  Object.assign(mapEl.style, {
    margin: "12px",
    borderRadius: "16px",
    overflow: "hidden"
  });

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

function startRealtimeFlow() {
  onAuthStateChanged(auth, (user) => {
    if (!user) return console.warn("Login required");
    authUser = user;
    
    // Blocked users management
    let blockedUsers = [];
    const unsubscribeBlocked = onSnapshot(doc(db, "users", authUser.uid), (doc) => {
      blockedUsers = doc.data()?.blocked || [];
      markers.forEach((markerObj, uid) => {
        if (blockedUsers.includes(uid)) {
          markerObj.marker.setMap(null);
          markers.delete(uid);
        }
      });
    });

    liveLocationUpdater();
    listenUsers(blockedUsers);

    // Cleanup on logout
    window.addEventListener('beforeunload', () => {
      unsubscribeBlocked();
    });
  });
}

function liveLocationUpdater() {
  if (!navigator.geolocation) return console.warn("Geolocation unsupported");
  
  const userRef = doc(db, "users", authUser.uid);
  const pushLocation = async () => {
    try {
      const pos = await new Promise((resolve, reject) => 
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      
      const { latitude: lat, longitude: lng } = pos.coords;
      await setDoc(userRef, {
        lat,
        lng,
        lastSeen: serverTimestamp(),
        photo: authUser.photoURL || "",
        username: authUser.displayName || ""
      }, { merge: true });
      
      await placeUserMarker({ lat, lng });
    } catch (error) {
      console.error("Geolocation error:", error);
    }
  };
  
  pushLocation();
  const intervalId = setInterval(pushLocation, UPDATE_MS);
  
  // Cleanup
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
  });
}

function listenUsers(blockedUsers) {
  const unsubscribe = onSnapshot(collection(db, "users"), snap => {
    snap.docChanges().forEach(chg => {
      const uid = chg.doc.id;
      const data = chg.doc.data();
      
      // Skip self and blocked users
      if (uid === authUser.uid || blockedUsers.includes(uid)) return;
      
      const pos = { lat: data.lat, lng: data.lng };
      
      if (chg.type === "removed") {
        markers.get(uid)?.marker.setMap(null);
        markers.delete(uid);
      } else if (!markers.has(uid)) {
        markers.set(uid, createFriendMarker(uid, data, pos));
      } else {
        const markerObj = markers.get(uid);
        markerObj.marker.setPosition(pos);
        
        // Update icon if photo changed
        if (data.photo !== markerObj.photoUrl) {
          markerObj.photoUrl = data.photo;
          loadFriendIcon(data.photo, markerObj.marker);
        }
      }
    });
  });
  
  // Cleanup
  window.addEventListener('beforeunload', unsubscribe);
}

async function placeUserMarker(position) {
  // Remove previous marker
  if (userMarker) userMarker.setMap(null);
  
  // Create new marker
  const iconUrl = await makeCircularImage(
    authUser.photoURL || "https://via.placeholder.com/96/333333/FFFFFF?text=USER",
    96,
    "#4caf50"
  );
  
  userMarker = new google.maps.Marker({
    position,
    map,
    icon: {
      url: iconUrl,
      scaledSize: new google.maps.Size(48, 48)
    },
    zIndex: 999,
    optimized: true
  });
  
  userMarker.setVisible(showLocation);
  map.panTo(position);
}

function createFriendMarker(uid, data, position) {
  // Default icon (blue circle)
  const defaultIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "#4285f4",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 20
  };
  
  const marker = new google.maps.Marker({
    position,
    map,
    icon: defaultIcon,
    title: data.username || "User"
  });
  
  // Store reference for updates
  const markerObj = { marker, photoUrl: data.photo };
  
  // Load profile icon
  loadFriendIcon(data.photo, marker);
  
  // Add click event
  marker.addListener("click", () => openPopup(uid, data, marker));
  
  return markerObj;
}

function loadFriendIcon(photoUrl, marker) {
  makeCircularImage(
    photoUrl || "https://via.placeholder.com/96/333333/FFFFFF?text=USER",
    80,
    "#4285f4"
  ).then(iconUrl => {
    marker.setIcon({
      url: iconUrl,
      scaledSize: new google.maps.Size(40, 40)
    });
  });
}

function openPopup(uid, data, marker) {
  const content = document.createElement("div");
  content.style.cssText = `
    width: 220px;
    font-family: 'Segoe UI', sans-serif;
    padding: 12px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  `;
  
  content.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <img src="${data.photo || 'https://via.placeholder.com/96'}" 
           style="width:48px;height:48px;border-radius:50%;object-fit:cover">
      <div>
        <strong>${data.username || 'Kullanıcı'}</strong>
        <div style="font-size:0.8em;color:#666">Son görülme: ${formatTime(data.lastSeen?.toDate())}</div>
      </div>
    </div>
    <div style="display:grid;gap:8px">
      <button class="popup-btn" data-action="message" data-uid="${uid}">
        <i class="fas fa-comment"></i> Mesaj Gönder
      </button>
      <button class="popup-btn" data-action="follow" data-uid="${uid}">
        <i class="fas ${data.followers?.includes(authUser.uid) ? 'fa-user-minus' : 'fa-user-plus'}"></i>
        ${data.followers?.includes(authUser.uid) ? 'Takipten Çık' : 'Takip Et'}
      </button>
      <button class="popup-btn" data-action="profile" data-uid="${uid}">
        <i class="fas fa-user"></i> Profili Gör
      </button>
      <button class="popup-btn" data-action="block" data-uid="${uid}">
        <i class="fas fa-ban"></i> Engelle
      </button>
      ${data.hasStory ? `
      <button class="popup-btn" data-action="story" data-uid="${uid}">
        <i class="fas fa-history"></i> Hikayeyi Gör
      </button>` : ''}
    </div>
  `;

  const popup = new google.maps.InfoWindow({
    content,
    maxWidth: 300
  });
  
  popup.open(map, marker);
  
  // Event delegation for buttons
  content.addEventListener('click', (e) => {
    if (!e.target.closest('.popup-btn')) return;
    const btn = e.target.closest('.popup-btn');
    const action = btn.dataset.action;
    const uid = btn.dataset.uid;
    
    switch(action) {
      case 'message':
        location.href = `/messages.html?uid=${uid}`;
        break;
      case 'follow':
        toggleFollow(uid);
        popup.close();
        break;
      case 'profile':
        location.href = `/profile.html?uid=${uid}`;
        break;
      case 'block':
        blockUser(uid);
        popup.close();
        break;
      case 'story':
        location.href = `/story.html?uid=${uid}`;
        break;
    }
  });
}

function formatTime(date) {
  if (!date) return 'Bilinmiyor';
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

window.toggleFollow = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const isFollowing = snap.data()?.followers?.includes(authUser.uid);
  
  await updateDoc(ref, {
    followers: isFollowing ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid)
  });
};

window.blockUser = async (uid) => {
  await updateDoc(doc(db, "users", authUser.uid), {
    blocked: arrayUnion(uid)
  });
  
  // Remove marker immediately
  const markerObj = markers.get(uid);
  if (markerObj) {
    markerObj.marker.setMap(null);
    markers.delete(uid);
  }
};

function renderControlIcons() {
  // Location visibility toggle
  locationBtn = floatingBtn(
    "fa-location-crosshairs", 
    "Konum Göster/Gizle", 
    "left", 
    "12px", 
    "88px",
    () => {
      showLocation = !showLocation;
      userMarker?.setVisible(showLocation);
      locationBtn.querySelector('i').className = 
        `fas ${showLocation ? 'fa-location-crosshairs' : 'fa-eye-slash'}`;
    }
  );

  // Dark/Light mode toggle
  themeBtn = floatingBtn(
    "fa-moon", 
    "Tema Değiştir", 
    "right", 
    "12px", 
    "88px",
    () => {
      darkMode = !darkMode;
      map.setMapId(darkMode ? MAP_ID_DARK : MAP_ID_LIGHT);
      themeBtn.querySelector('i').className = 
        `fas ${darkMode ? 'fa-moon' : 'fa-sun'}`;
    }
  );
}

function floatingBtn(icon, title, side, x, bottom, cb) {
  const btn = document.createElement("div");
  btn.innerHTML = `<i class="fas ${icon}"></i>`;
  Object.assign(btn.style, {
    position: "absolute",
    [side]: x,
    bottom: bottom,
    background: "#1e1e1e",
    color: "#fff",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,.5)",
    zIndex: 1000,
    fontSize: "18px",
    transition: "transform 0.2s, background 0.3s"
  });
  
  btn.title = title;
  btn.addEventListener('click', cb);
  
  // Hover effects
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.background = '#2a2a2a';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.background = '#1e1e1e';
  });
  
  document.body.appendChild(btn);
  return btn;
}

function makeCircularImage(src, size, borderColor) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = "anonymous";
    img.src = src;
    
    img.onload = () => {
      // Draw circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
      ctx.closePath();
      ctx.clip();
      
      // Draw image
      ctx.drawImage(img, 0, 0, size, size);
      ctx.restore();
      
      // Add border
      if (borderColor) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = borderColor;
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI*2);
        ctx.stroke();
      }
      
      resolve(canvas.toDataURL());
    };
    
    img.onerror = () => {
      // Fallback on error
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
      ctx.fill();
      resolve(canvas.toDataURL());
    };
  });
}
