// initProfile.js
import { loadProfileData } from './userData.js';
import { loadPosts } from './postRenderer.js';

document.addEventListener('DOMContentLoaded', () => {
  const DOM = {
    topUsername: document.getElementById('topUsername'),
    fullNameEl: document.getElementById('fullName'),
    bioEl: document.getElementById('bioText'),
    avatar: document.getElementById('avatar'),
    followersEl: document.getElementById('followersCount'),
    followingEl: document.getElementById('followingCount'),
    storiesEl: document.getElementById('storiesCount'),
    postsGrid: document.getElementById('postsGrid'),
  };

  loadProfileData(DOM);
  loadPosts(DOM);
});