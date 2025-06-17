// Profil ikonu oluşturan fonksiyon
function createProfileIcon() {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
       <circle cx="30" cy="30" r="20"
               fill="transparent"
               stroke="#4285F4"
               stroke-width="4"/>
     </svg>`;
  return {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(40, 40),
    anchor:     new google.maps.Point(20, 20)
  };
}

let map, selfMarker;

// Global scope'a bağla
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
          mapTypeControl:    false,
          fullscreenControl: false,
          streetViewControl: false,
          rotateControl:     false,
          scaleControl:      false
        });

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
