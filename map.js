// 1. Dark ve Light mod stilleri
const darkModeStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#383838" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
];

const lightModeStyle = []; // Google'ın varsayılan light temasını bozmadan geçiş yapılır

// 2. Profil ikonu (büyük daire)
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

let map, selfMarker, currentTheme = "dark";

// 3. Tema değiştirme
function toggleMapTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  const style = currentTheme === "dark" ? darkModeStyle : lightModeStyle;
  map.setOptions({ styles: style });
  document.getElementById("themeToggle").textContent = currentTheme === "dark" ? "☀️" : "🌙";
}

// 4. Haritayı başlat
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

        // Tema butonunu oluştur
        const themeButton = document.createElement("button");
        themeButton.id = "themeToggle";
        themeButton.textContent = "☀️";
        themeButton.style.cssText = `
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 999;
          background: #1e1e1e;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        `;
        themeButton.onclick = toggleMapTheme;
        document.getElementById("map").appendChild(themeButton);

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