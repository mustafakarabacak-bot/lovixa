// scripts/profile/storyRenderer.js

import { auth, db } from '../firebase.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

export async function loadStories(DOM) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const storiesRef = collection(db, "stories");
    const q = query(storiesRef,
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    DOM.tabContent.innerHTML = '';

    if (snapshot.empty) {
      DOM.tabContent.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-history"></i>
          <h3>Hikayen Yok</h3>
          <p>Hikaye eklemek için yukarıdaki "Hikaye Ekle" butonunu kullan.</p>
        </div>`;
      return;
    }

    const container = document.createElement('div');
    container.className = 'posts-grid';

    snapshot.forEach(doc => {
      const story = doc.data();
      const el = document.createElement('div');
      el.className = 'post-item';
      el.innerHTML = `
        ${story.type === "video"
          ? `<video src="${story.url}" controls muted style="width:100%;height:100%;object-fit:cover;"></video>`
          : `<img src="${story.url}" alt="Story">`
        }
      `;
      container.appendChild(el);
    });

    DOM.tabContent.appendChild(container);
  });
}