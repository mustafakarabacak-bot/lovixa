// postRenderer.js
import { db, auth } from '../firebase.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  where
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

export function loadPosts(DOM) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("uid", "==", user.uid), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    DOM.postsGrid.innerHTML = "";

    snapshot.forEach(doc => {
      const post = doc.data();
      const postEl = document.createElement("div");
      postEl.className = "post-item";
      postEl.innerHTML = `
        <img src="${post.imageURL}" alt="Post">
        <div class="post-stats">
          <div class="post-stat"><i class="fas fa-heart"></i>${post.likes?.length || 0}</div>
          <div class="post-stat"><i class="fas fa-comment"></i>${post.comments?.length || 0}</div>
        </div>
      `;
      DOM.postsGrid.appendChild(postEl);
    });
  });
}