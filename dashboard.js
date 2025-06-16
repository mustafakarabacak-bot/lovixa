<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Lovixa | Dashboard</title>

  <!-- Leaflet -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <link rel="stylesheet" href="./theme.css" />
  <script type="module" src="./dashboard.js"></script>
</head>
<body>
  <header class="topbar">
    <button id="location-toggle" class="icon">📍</button>
    <h1>LOVIXA</h1>
    <button id="logout-btn"   class="icon">↩︎</button>
  </header>

  <main id="map" class="map"></main>
  <div id="loader" class="loader"></div>

  <nav class="bottom-nav">
    <a href="dashboard.html" class="icon">🏠</a>
    <a href="messages.html"  class="icon">💬</a>
    <a href="profile.html"   class="icon">👤</a>
  </nav>
</body>
</html>