// scripts/profile/initProfile.js
import { loadProfileData } from './userData.js';
import { loadPosts } from './postRenderer.js';
import { setupModalCloseEvents } from './modals.js';
import { setupPopupEvents } from './popups.js';
import { attachEvents } from './eventHandlers.js';

document.addEventListener('DOMContentLoaded', () => {
  const DOM = {
    /* ─── Header & Avatar ─── */
    topUsername:      document.getElementById('topUsername'),
    accountToggle:    document.getElementById('accountToggle'),
    accountMenu:      document.getElementById('accountMenu'),
    logoutBtn:        document.getElementById('logoutBtn'),
    avatar:           document.getElementById('avatar'),
    avatarMenu:       document.getElementById('avatarMenu'),

    /* ─── Profil Bilgileri ─── */
    fullNameEl:       document.getElementById('fullName'),
    bioEl:            document.getElementById('bioText'),
    followersEl:      document.getElementById('followersCount'),
    followingEl:      document.getElementById('followingCount'),
    storiesEl:        document.getElementById('storiesCount'),

    /* ─── Navigasyon & İçerik ─── */
    quickEdit:        document.getElementById('quickEdit'),
    quickEditMenu:    document.getElementById('quickEditMenu'),
    tabsNav:          document.getElementById('tabsNav'),
    tabContent:       document.getElementById('tabContent'),
    postsGrid:        document.getElementById('postsGrid'),

    /* ─── Modallar & Overlay ─── */
    editProfileBtn:   document.getElementById('editProfileBtn'),
    editProfileModal: document.getElementById('editProfileModal'),
    addStoryBtn:      document.getElementById('addStoryBtn'),
    addStoryAvatar:   document.getElementById('addStoryAvatar'),
    addStoryModal:    document.getElementById('addStoryModal'),
    overlay:          document.getElementById('overlay'),

    /* ─── Story Yükleme Alanı ─── */
    storyUploadArea:  document.getElementById('storyUploadArea'),
    storyImage:       document.getElementById('storyImage'),
    storyCaption:     document.getElementById('storyCaption'),
    publishStory:     document.getElementById('publishStory'),

    /* ─── Profil Kaydet ─── */
    saveProfileBtn:   document.getElementById('saveProfile'),
  };

  loadProfileData(DOM);
  loadPosts(DOM);
  setupModalCloseEvents();
  setupPopupEvents(DOM);
  attachEvents(DOM);
});