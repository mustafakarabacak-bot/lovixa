// userData.js
import { db, auth } from '../firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

export function formatNumber(num) {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
}

export async function loadProfileData(DOM) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return location.href = "/loginregisterpage.html";
    
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    DOM.topUsername.textContent = "@" + (data.username || "bilinmeyen");
    DOM.fullNameEl.textContent = data.fullName || "Kullanıcı";
    DOM.bioEl.textContent = data.bio || "";
    DOM.avatar.src = data.photoURL || "https://i.pravatar.cc/150?u=" + user.uid;
    DOM.followersEl.textContent = formatNumber(data.followers?.length || 0);
    DOM.followingEl.textContent = formatNumber(data.following?.length || 0);
    DOM.storiesEl.textContent = formatNumber(data.storyCount || 0);
  });
}