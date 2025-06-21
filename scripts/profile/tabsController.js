// scripts/profile/tabsController.js

import { loadPosts } from './postRenderer.js';
import { loadStories } from './storyRenderer.js';

export function setupTabs(DOM) {
  const tabs = DOM.tabsNav.querySelectorAll('.tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      DOM.tabsNav.querySelector('.active').classList.remove('active');
      tab.classList.add('active');
      const currentTab = tab.dataset.tab;

      if (currentTab === 'posts') {
        DOM.tabContent.innerHTML = '<div class="posts-grid" id="postsGrid"></div>';
        DOM.postsGrid = document.getElementById('postsGrid');
        loadPosts(DOM);
      }

      else if (currentTab === 'activity') {
        DOM.tabContent.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-heart"></i>
            <h3>Etkinlik Yok</h3>
            <p>Beğeni, takip, yorum gibi hareketlerin burada listelenecek.</p>
          </div>`;
      }

      else if (currentTab === 'stories') {
        loadStories(DOM);
      }
    });
  });
}