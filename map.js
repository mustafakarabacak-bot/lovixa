const darkModeStyle = [/*... aynı dark stil ...*/];
const lightModeStyle = [];

function createProfileIcon() {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
       <circle cx="40" cy="40" r="30"
               fill="transparent"
               stroke="#4285F4"
               stroke-width="4"/>
     </svg>`;
  return {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(60, 60),
    anchor:     new google.maps.Point(30, 30)
  };
}

let map, selfMarker, currentTheme = "dark", locationVisible = true;

function toggleMapTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  map.setOptions({ styles: currentTheme === "dark" ? darkModeStyle : lightModeStyle });
  document.getElementById("theme-icon").innerHTML = currentTheme === "dark" ? sunIcon : moonIcon;
}

function toggleLocationVisibility() {
  locationVisible = !locationVisible;
  if (selfMarker) selfMarker.setVisible(locationVisible);
  document.getElementById("eye-icon").innerHTML = locationVisible ? eyeOpen : eyeClosed;

  if (!locationVisible) {
    console.log("Konum gizlendi – diğer kullanıcılar artık izleyebilir."); // Burada backend'e sinyal gönderilebilir
  }
}

// SVG ikonlar
const sunIcon = `<svg fill="white" width="20" viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8zM1 13h3v-2H1zm10-9h2V1h-2zm7.66 2.46l1.79-1.8-1.41-1.41-1.8 1.79zM20 11v2h3v-2zm-9 9h2v-3h-2zm4.24-2.84l1.8 1.79 1.41-1.41-1.79-1.8zM4.34 19.54l1.8-1.79-1.41-1.41-1.8 1.79zM12 6a6 6 0 100 12 6 6 0 000-12z"/></svg>`;
const moonIcon = `<svg fill="white" width="20" viewBox="0 0 24 24"><path d="M9.37 5.51a7.5 7.5 0 108.12 8.12 9 9 0 01-8.12-8.12z"/></svg>`;
const eyeOpen = `<svg fill="white" width="20" viewBox="0 0 24 24"><path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/><circle cx="12" cy="12" r="2.5"/></svg>`;
const eyeClosed = `<svg fill="white" width="20" viewBox="0 0 24 24"><path d="M12 6c-4.97 0-9.27 3.11-11 7 1.01 2.27 2.76 4.15 4.89 5.26l-1.39 1.39 1.41 1.41 17.32-17.32-1.41-1.41-3.31 3.31A10.978 10.978 0 0012 6zm0 12c-1.21 0-2.36-.2-3.43-.56l1.83-1.83A5 5 0 0017 12c0-.91-.24-1.76-.66-2.5l1.55-1.55A9.36 9.36 0 0121 12c-1.73 3.89-6 7-11 7z"/></svg>`;

window.initMap = function () {
  if (!navigator.geolocation) {
    alert("Tarayıcınız konum servisini desteklemiyor.");
    return;
  }

  navigator.geolocation.watchPosition(
    pos => {
      const latLng = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      if (!map) {
        map = new google.maps.Map(document.getElementById("map"), {
          zoom: 16,
          center: latLng,
          disableDefaultUI: true,
          gestureHandling: "greedy",
          styles: darkModeStyle
        });

        // UI panel
        const panel = document.createElement("div");
        panel.style.cssText = `
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 999;
          display: flex;
          gap: 8px;
        `;

        const themeBtn = document.createElement("button");
        themeBtn.id = "theme-icon";
        themeBtn.innerHTML = sunIcon;
        themeBtn.style.cssText = `
          background: #1e1e1e; color: white; border: none;
          padding: 8px; border-radius: 8px; cursor: pointer;
        `;
        themeBtn.onclick = toggleMapTheme;

        const eyeBtn = document.createElement("button");
        eyeBtn.id = "eye-icon";
        eyeBtn.innerHTML = eyeOpen;
        eyeBtn.style.cssText = themeBtn.style.cssText;
        eyeBtn.onclick = toggleLocationVisibility;

        panel.appendChild(eyeBtn);
        panel.appendChild(themeBtn);
        document.getElementById("map").appendChild(panel);

        selfMarker = new google.maps.Marker({
          position: latLng,
          map: map,
          icon: createProfileIcon(),
          optimized: true
        });
      } else {
        selfMarker.setPosition(latLng);
        map.setCenter(latLng);
      }
    },
    err => {
      console.error("Konum Hatası:", err);
      alert("Konum alınamadı: " + err.message);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};