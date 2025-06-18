// layoutUI.js
export function renderTopBar() {
  const topBarHTML = `
    <style>
      #topbar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 56px;
        background-color: #1e1e1e;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        z-index: 1000;
        border-bottom: 1px solid #333;
      }
      #topbar img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
      }
      #topbar input {
        flex: 1;
        margin: 0 12px;
        padding: 8px 12px;
        border-radius: 20px;
        border: none;
        background-color: #2a2a2a;
        color: white;
        font-size: 0.9rem;
      }
      #topbar .icon {
        font-size: 20px;
        color: white;
        cursor: pointer;
      }
    </style>
    <img src="https://i.hizliresim.com/oe86t17.png" alt="Profil" />
    <input type="text" placeholder="Ara..." readonly />
    <div class="icon" id="msgIcon">💬</div>
  `;
  document.getElementById('topbar').innerHTML = topBarHTML;

  document.getElementById('msgIcon').onclick = () => {
    window.location.href = "messages.html";
  };
}

export function renderBottomBar() {
  const bottomBarHTML = `
    <style>
      #bottombar {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 56px;
        background-color: #1e1e1e;
        display: flex;
        justify-content: space-around;
        align-items: center;
        border-top: 1px solid #333;
        z-index: 1000;
      }
      #bottombar .btn {
        color: #aaa;
        font-size: 22px;
        text-align: center;
        flex: 1;
        cursor: pointer;
        transition: 0.2s;
      }
      #bottombar .btn.active {
        color: #4caf50;
      }
    </style>
    <div class="btn" id="navHome">🏠</div>
    <div class="btn" id="navMap">📍</div>
    <div class="btn" id="navCreate">➕</div>
    <div class="btn" id="navNotif">🔔</div>
    <div class="btn" id="navProfile">👤</div>
  `;
  document.getElementById('bottombar').innerHTML = bottomBarHTML;

  // Yönlendirmeler:
  document.getElementById('navHome').onclick = () => location.href = "home.html";
  document.getElementById('navMap').onclick = () => location.href = "map.html";
  document.getElementById('navCreate').onclick = () => location.href = "create.html";
  document.getElementById('navNotif').onclick = () => location.href = "notifications.html";
  document.getElementById('navProfile').onclick = () => location.href = "profile.html";
}

// Otomatik çağır (istenirse manuel yapılabilir)
renderTopBar();
renderBottomBar();