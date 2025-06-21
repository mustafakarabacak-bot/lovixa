// scripts/profile/initProfile.js

import { loadProfileData } from './userData.js';
import { loadPosts } from './postRenderer.js';
import { setupModalCloseEvents } from './modals.js';
import { setupPopupEvents } from './popups.js';
import { attachEvents } from './eventHandlers.js';

document.addEventListener('DOMContentLoaded', () => {
  const DOM = {
    topUsername: document.getElementById('topUsername'),
    accountToggle: document.getElementById('accountToggle'),
    accountMenu: document.getElementById('accountMenu'),
    logoutBtn: document.getElementById('logoutBtn'),
    switchAccountBtn: document.getElementById('switchAccountBtn'),
    avatar: document.getElementById('avatar'),
    avatarMenu: document.getElementById('avatarMenu'),
    fullNameEl: document.getElementById('fullName'),
    bioEl: document.getElementById('bioText'),
    followersEl: document.getElementById('followersCount'),
    followingEl: document.getElementById('followingCount'),
    storiesEl: document.getElementById('storiesCount'),
    settingsBtn: document.getElementById('settingsBtn'),
    tabsNav: document.getElementById('tabsNav'),
    tabContent: document.getElementById('tabContent'),
    quickEdit: document.getElementById('quickEdit'),
    quickEditMenu: document.getElementById('quickEditMenu'),
    editProfileBtn: document.getElementById('editProfileBtn'),
    addStoryBtn: document.getElementById('addStoryBtn'),
    addStoryAvatar: document.getElementById('addStoryAvatar'),
    changeAvatar: document.getElementById('changeAvatar'),
    removeAvatar: document.getElementById('removeAvatar'),
    editProfileModal: document.getElementById('editProfileModal'),
    addStoryModal: document.getElementById('addStoryModal'),
    storyUploadArea: document.getElementById('storyUploadArea'),
    storyImage: document.getElementById('storyImage'),
    publishStory: document.getElementById('publishStory'),
    postsGrid: document.getElementById('postsGrid'),
    overlay: document.getElementById('overlay')
  };

  loadProfileData(DOM);
  loadPosts(DOM);
  setupModalCloseEvents();
  setupPopupEvents(DOM);
  attachEvents(DOM);
});