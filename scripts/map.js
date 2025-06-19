window.initMap = function () {
  const defaultLocation = { lat: 41.015137, lng: 28.979530 }; // İstanbul

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: defaultLocation,
    mapId: "DEMO_MAP_ID", // İsteğe bağlı: özel stil için
    disableDefaultUI: false,
  });

  // Kullanıcının konumunu al
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(pos);
        new google.maps.Marker({
          position: pos,
          map,
          title: "Benim Konumum",
        });
      },
      () => {
        console.warn("Konum erişimi reddedildi.");
      }
    );
  } else {
    console.warn("Geolocation desteklenmiyor.");
  }
};
