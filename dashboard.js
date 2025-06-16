<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Lovixa - Dashboard</title>
  <style>
    :root {
      --bg-color: #0d0d0d;
      --card-color: #1e1e1e;
      --primary: #4caf50;
      --primary-hover: #43a047;
      --text-color: #ffffff;
      --transition: all 0.2s ease-in-out;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: "Segoe UI", sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      background-color: var(--card-color);
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary);
    }

    #user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    #logout-btn {
      background: none;
      border: 1px solid var(--primary);
      color: var(--primary);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      transition: var(--transition);
    }

    #logout-btn:hover {
      background-color: var(--primary);
      color: white;
    }

    #map-container {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    #map {
      height: 100%;
      width: 100%;
    }

    #loader {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(13, 13, 13, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      transition: opacity 0.3s ease;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      border-top-color: var(--primary);
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    #location-controls {
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 10;
    }

    .control-btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: var(--card-color);
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .control-btn:hover {
      background-color: var(--primary);
      transform: scale(1.1);
    }

    .hidden {
      display: none !important;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">LOVIXA</div>
    <div id="user-info">
      <div id="user-avatar">U</div>
      <button id="logout-btn">Çıkış Yap</button>
    </div>
  </header>
  
  <div id="map-container">
    <div id="loader">
      <div class="spinner"></div>
      <p>Harita yükleniyor...</p>
    </div>
    <div id="map"></div>
    
    <div id="location-controls">
      <button id="location-toggle" class="control-btn">📍</button>
    </div>
  </div>

  <!-- Firebase ve Harita SDK'ları -->
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap" async defer></script>
  
  <script type="module">
    // Firebase konfigürasyon
    const firebaseConfig = {
      apiKey: "AIzaSyDslfjDqEpqQekNxh9e4OqYYkxdf2TUI7E",
      authDomain: "silicon-park-462509-r3.firebaseapp.com",
      projectId: "silicon-park-462509-r3",
      storageBucket: "silicon-park-462509-r3.appspot.com",
      messagingSenderId: "463275849598",
      appId: "1:463275849598:web:19ffa6e6e5e1ff5077252f"
    };
    
    // Firebase uygulamasını başlat
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // DOM elementleri
    const loader = document.getElementById("loader");
    const mapArea = document.getElementById("map");
    const toggleBtn = document.getElementById("location-toggle");
    const logoutBtn = document.getElementById("logout-btn");
    const userAvatar = document.getElementById("user-avatar");
    
    // Kullanıcı oturum durumunu izle
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // Kullanıcı oturum açmamışsa giriş sayfasına yönlendir
        window.location.href = "login.html";
        return;
      }
      
      // Kullanıcı bilgilerini göster
      if (user.displayName) {
        userAvatar.textContent = user.displayName.charAt(0).toUpperCase();
      }
      
      // Harita SDK'sını bekleyerek haritayı başlat
      await waitForMapsSDK();
      initRealtimeMap(user);
    });
    
    // Google Maps SDK'nın yüklenmesini bekleyen fonksiyon
    function waitForMapsSDK() {
      return new Promise((resolve) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }
        
        // SDK zaten yüklenmiş mi kontrol et
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }
    
    // Harita başlatma fonksiyonu
    function initRealtimeMap(user) {
      // Loader'ı kapat
      loader.classList.add("hidden");
      
      // Haritayı oluştur
      const map = new google.maps.Map(mapArea, {
        center: { lat: 41.0082, lng: 28.9784 }, // İstanbul
        zoom: 12,
        disableDefaultUI: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }]
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }]
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }]
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }]
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }]
          }
        ]
      });
      
      // Konum takip özelliği
      let watchId = null;
      let userMarker = null;
      
      toggleBtn.addEventListener("click", () => {
        if (watchId) {
          // Konum takibini durdur
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
          toggleBtn.textContent = "📍";
          
          if (userMarker) {
            userMarker.setMap(null);
            userMarker = null;
          }
        } else {
          // Konum takibini başlat
          toggleBtn.textContent = "❌";
          
          watchId = navigator.geolocation.watchPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              
              // Haritayı konuma odakla
              map.setCenter(pos);
              
              // Kullanıcı marker'ını güncelle
              if (!userMarker) {
                userMarker = new google.maps.Marker({
                  position: pos,
                  map: map,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#4CAF50",
                    fillOpacity: 1,
                    strokeColor: "#FFFFFF",
                    strokeWeight: 2
                  }
                });
              } else {
                userMarker.setPosition(pos);
              }
              
              // Konumu Firestore'a kaydet
              db.collection("userLocations").doc(user.uid).set({
                uid: user.uid,
                position: new firebase.firestore.GeoPoint(pos.lat, pos.lng),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                email: user.email,
                displayName: user.displayName || "Kullanıcı"
              });
            },
            (error) => {
              console.error("Konum alınamadı:", error);
              alert("Konum bilgisi alınamadı. Lütfen izinlerinizi kontrol edin.");
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
          );
        }
      });
      
      // Diğer kullanıcıların konumlarını dinle
      db.collection("userLocations").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" || change.type === "modified") {
            const data = change.doc.data();
            
            // Kendi konumumuzu gösterme
            if (data.uid === user.uid) return;
            
            // Diğer kullanıcılar için marker oluştur
            const marker = new google.maps.Marker({
              position: new google.maps.LatLng(
                data.position.latitude, 
                data.position.longitude
              ),
              map: map,
              title: data.displayName
            });
            
            // 30 saniye sonra marker'ı kaldır
            setTimeout(() => {
              marker.setMap(null);
            }, 30000);
          }
        });
      });
    }
    
    // Çıkış butonu
    logoutBtn.addEventListener("click", () => {
      auth.signOut().then(() => {
        window.location.href = "login.html";
      });
    });
    
    // 10 saniye içinde oturum açılmazsa giriş sayfasına yönlendir
    setTimeout(() => {
      if (!auth.currentUser) {
        window.location.href = "login.html";
      }
    }, 10000);
  </script>
</body>
</html>