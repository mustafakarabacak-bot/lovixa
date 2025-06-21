import { loadProfileData } from './userData.js';
import { loadPosts } from './postRenderer.js';
import { setupModalCloseEvents } from './modals.js';
import { setupPopupEvents } from './popups.js';
import { attachEvents } from './eventHandlers.js';
import { setupTabs } from './tabsController.js';

document.addEventListener('DOMContentLoaded', () => {
  const DOM = {
    topUsername:      document.getElementById('topUsername'),
    accountToggle:    document.getElementById('accountToggle'),
    accountMenu:      document.getElementById('accountMenu'),
    logoutBtn:        document.getElementById('logoutBtn'),
    avatar:           document.getElementById('avatar'),
    avatarMenu:       document.getElementById('avatarMenu'),
    fullNameEl:       document.getElementById('fullName'),
    bioEl:            document.getElementById('bioText'),
    followersEl:      document.getElementById('followersCount'),
    followingEl:      document.getElementById('followingCount'),
    storiesEl:        document.getElementById('storiesCount'),
    settingsBtn:      document.getElementById('settingsBtn'),
    quickEdit:        document.getElementById('quickEdit'),
    quickEditMenu:    document.getElementById('quickEditMenu'),
    tabsNav:          document.getElementById('tabsNav'),
    tabContent:       document.getElementById('tabContent'),
    postsGrid:        document.getElementById('postsGrid'),
    editProfileBtn:   document.getElementById('editProfileBtn'),
    addStoryBtn:      document.getElementById('addStoryBtn'),
    addStoryAvatar:   document.getElementById('addStoryAvatar'),
    editProfileModal: document.getElementById('editProfileModal'),
    addStoryModal:    document.getElementById('addStoryModal'),
    overlay:          document.getElementById('overlay'),
    storyUploadArea:  document.getElementById('storyUploadArea'),
    storyImage:       document.getElementById('storyImage'),
    storyCaption:     document.getElementById('storyCaption'),
    publishStory:     document.getElementById('publishStory'),
    saveProfileBtn:   document.getElementById('saveProfile'),
  };

  loadProfileData(DOM);
  loadPosts(DOM);
  setupTabs(DOM);
  setupModalCloseEvents();
  setupPopupEvents(DOM);
  attachEvents(DOM);
});