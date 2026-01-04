window.onload = function () {
  const geoStatusEl = document.getElementById("geoStatus");
  const toastEl = document.getElementById("toast");

  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  const markerNameInput = document.getElementById("markerName");
  const iconSelect = document.getElementById("iconSelect");
  const addMarkerBtn = document.getElementById("addMarkerBtn");

  const measureToggle = document.getElementById("measureToggle");
  const measureClear = document.getElementById("measureClear");
  const measureInfo = document.getElementById("measureInfo");

  const routeToggle = document.getElementById("routeToggle");
  const routeClear = document.getElementById("routeClear");
  const routeInfo = document.getElementById("routeInfo");

  const nearbyRadiusInput = document.getElementById("nearbyRadius");
  const nearbyRefreshBtn = document.getElementById("nearbyRefresh");
  const nearbyList = document.getElementById("nearbyList");

  const geoFenceLog = document.getElementById("geoFenceLog");

  const FALLBACK = { lat: 44.4268, lng: 26.1025, zoom: 13 };
  const map = L.map("map").setView([FALLBACK.lat, FALLBACK.lng], FALLBACK.zoom);

  const baseOSM = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  const baseHot = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap — HOT'
  });

  const baseTopo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  });

  const baseLight = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: '&copy; CARTO &copy; OpenStreetMap'
  });

  const baseDark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: '&copy; CARTO &copy; OpenStreetMap'
  });

  const baseSat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
  });

  baseOSM.addTo(map);

  const userMarkers = L.layerGroup().addTo(map);

  const placesRestaurants = L.layerGroup().addTo(map);
  const placesParks = L.layerGroup().addTo(map);
  const placesShops = L.layerGroup().addTo(map);
  const placesFavorites = L.layerGroup().addTo(map);

  const measureLayer = L.layerGroup().addTo(map);
  const routeLayer = L.layerGroup().addTo(map);
  const geoFenceLayer = L.layerGroup().addTo(map);

  L.control.layers(
    {
      "OpenStreetMap": baseOSM,
      "OSM Humanitarian (HOT)": baseHot,
      "Light": baseLight,
      "Dark": baseDark,
      "Topographic": baseTopo,
      "Satellite": baseSat
    },
    {
      "User markers": userMarkers,
      "Places — Restaurants": placesRestaurants,
      "Places — Parks": placesParks,
      "Places — Shops": placesShops,
      "Places — Favorites": placesFavorites,
      "Measure": measureLayer,
      "Route": routeLayer,
      "Geofences": geoFenceLayer
    },
    { collapsed: true }
  ).addTo(map);

  function emojiIcon(emoji, color) {
    return L.divIcon({
      className: "emoji-marker",
      html: `<div style="
        width: 30px; height: 30px;
        display:flex; align-items:center; justify-content:center;
        border-radius: 999px;
        background: ${color};
        border: 2px solid rgba(0,0,0,0.25);
        box-shadow: 0 4px 10px rgba(0,0,0,0.18);
        font-size: 16px;
      ">${emoji}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  const ICONS = {
    star: emojiIcon("⭐", "#ffe58f"),
    home: emojiIcon("🏠", "#b7eb8f"),
    coffee: emojiIcon("☕", "#ffd6e7"),
    park: emojiIcon("🌳", "#95de64"),
    shop: emojiIcon("🛒", "#d3adf7"),
    pin: emojiIcon("📍", "#91caff")
  };

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function setGeoStatus(text, kind) {
    geoStatusEl.textContent = text;
    geoStatusEl.style.background =
      kind === "ok" ? "#e6fffb" :
      kind === "warn" ? "#fffbe6" :
      "#fff1f0";
  }

  function formatDistance(meters) {
    const km = meters / 1000;
    const miles = meters / 1609.344;
    if (meters < 1000) return `${meters.toFixed(0)} m (${miles.toFixed(2)} mi)`;
    return `${km.toFixed(2)} km (${miles.toFixed(2)} mi)`;
  }

  const PLACES = [
    { name: "Cărturești Carusel", category: "favorite", lat: 44.4313, lng: 26.1027, desc: "Bookstore landmark", link: "https://www.google.com/maps?q=Carturesti+Carusel" },
    { name: "Herăstrău Park", category: "park", lat: 44.4764, lng: 26.0822, desc: "Large park / lake", link: "https://www.google.com/maps?q=Herastrau+Park" },
    { name: "Cișmigiu Gardens", category: "park", lat: 44.4372, lng: 26.0871, desc: "Central park", link: "https://www.google.com/maps?q=Cismigiu+Gardens" },
    { name: "Coffee Shop", category: "restaurant", lat: 44.4449, lng: 26.0991, desc: "Example cafe point", link: "https://www.google.com/maps?q=coffee+near+bucharest" },
    { name: "Old Town Restaurant", category: "restaurant", lat: 44.4325, lng: 26.1030, desc: "Example restaurant point", link: "https://www.google.com/maps?q=restaurant+near+bucharest+old+town" },
    { name: "Mega Image", category: "shop", lat: 44.4472, lng: 26.0977, desc: "Example shop point", link: "https://www.google.com/maps?q=Mega+Image+Bucuresti" }
  ];

  function groupForCategory(cat) {
    if (cat === "restaurant") return placesRestaurants;
    if (cat === "park") return placesParks;
    if (cat === "shop") return placesShops;
    return placesFavorites;
  }

  function iconForCategory(cat) {
    if (cat === "restaurant") return ICONS.coffee;
    if (cat === "park") return ICONS.park;
    if (cat === "shop") return ICONS.shop;
    return ICONS.star;
  }

  const placeMarkers = [];

  function renderPlaces() {
    [placesRestaurants, placesParks, placesShops, placesFavorites].forEach(g => g.clearLayers());
    placeMarkers.length = 0;

    PLACES.forEach(p => {
      const marker = L.marker([p.lat, p.lng], { icon: iconForCategory(p.category) });
      marker.bindPopup(`
        <strong>${p.name}</strong><br/>
        <em>${p.category}</em><br/>
        <div style="margin-top:6px">${p.desc}</div>
        <div style="margin-top:8px"><a target="_blank" rel="noreferrer" href="${p.link}">Open link</a></div>
        <div style="margin-top:8px" class="muted">(${p.lat.toFixed(5)}, ${p.lng.toFixed(5)})</div>
      `);
      groupForCategory(p.category).addLayer(marker);
      placeMarkers.push({ place: p, marker });
    });
  }
  renderPlaces();

  let fences = [];
  let homeFence = null;

  function logFence(msg) {
    const div = document.createElement("div");
    div.className = "item";
    const t = new Date().toLocaleTimeString();
    div.textContent = `[${t}] ${msg}`;
    geoFenceLog.prepend(div);
  }

  function createFence(name, center, radiusMeters) {
    const circle = L.circle(center, {
      radius: radiusMeters,
      color: "#1677ff",
      fillColor: "rgba(22,119,255,0.18)",
      fillOpacity: 0.35
    }).bindPopup(`<strong>${name}</strong><br/>Radius: ${radiusMeters} m`);
    geoFenceLayer.addLayer(circle);
    return { name, center, radius: radiusMeters, circle, inside: false };
  }

  function createOrUpdateHomeFence(center) {
    if (homeFence) {
      geoFenceLayer.removeLayer(homeFence.circle);
      fences = fences.filter(f => f !== homeFence);
      homeFence = null;
    }
    homeFence = createFence("Home zone", center, 200);
    fences.push(homeFence);

    if (!createOrUpdateHomeFence._staticAdded) {
      const oldTown = L.latLng(44.4325, 26.1030);
      fences.push(createFence("Old Town zone", oldTown, 250));
      createOrUpdateHomeFence._staticAdded = true;
    }
  }

  function checkFences(posLatLng) {
    fences.forEach(f => {
      const d = posLatLng.distanceTo(f.center);
      const nowInside = d <= f.radius;

      if (!f.inside && nowInside) {
        f.inside = true;
        showToast(`Entered: ${f.name}`);
        logFence(`Entered ${f.name}`);
      } else if (f.inside && !nowInside) {
        f.inside = false;
        showToast(`Exited: ${f.name}`);
        logFence(`Exited ${f.name}`);
      }
    });
  }

  let userLatLng = null;
  let userMarker = null;
  let accuracyCircle = null;

  function onGeoSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const acc = position.coords.accuracy;

    userLatLng = L.latLng(lat, lng);
    setGeoStatus(`Lat ${lat.toFixed(5)} • Lng ${lng.toFixed(5)} • ±${acc.toFixed(0)} m`, "ok");

    if (!userMarker) {
      userMarker = L.marker(userLatLng, { icon: ICONS.pin }).addTo(map);
      userMarker.bindPopup(`<strong>You are here</strong><br/>Accuracy: ±${acc.toFixed(0)} m`);
    } else {
      userMarker.setLatLng(userLatLng);
    }

    if (!accuracyCircle) {
      accuracyCircle = L.circle(userLatLng, {
        color: "green",
        fillColor: "rgba(62, 240, 62, 1)",
        fillOpacity: 0.2,
        radius: acc
      }).addTo(map);
    } else {
      accuracyCircle.setLatLng(userLatLng);
      accuracyCircle.setRadius(acc);
    }

    checkFences(userLatLng);

    if (!onGeoSuccess._centered) {
      map.setView(userLatLng, 18);
      onGeoSuccess._centered = true;

      createOrUpdateHomeFence(userLatLng);
      refreshNearby();
      checkFences(userLatLng);
    }
  }

  function onGeoError(err) {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation not supported. Using fallback map.", "warn");
      showToast("Geolocation not supported by your browser.");
      return;
    }

    let msg = "Geolocation error.";
    if (err.code === err.PERMISSION_DENIED) msg = "Permission denied. Using fallback map.";
    else if (err.code === err.POSITION_UNAVAILABLE) msg = "Position unavailable. Using fallback map.";
    else if (err.code === err.TIMEOUT) msg = "Geolocation timeout. Using fallback map.";

    setGeoStatus(msg, "warn");
    showToast(msg);
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 2000
    });

    navigator.geolocation.watchPosition(onGeoSuccess, onGeoError, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 2000
    });
  } else {
    onGeoError({ code: -1 });
  }

  addMarkerBtn.addEventListener("click", () => {
    const center = map.getCenter();
    const iconKey = iconSelect.value;
    const title = markerNameInput.value.trim() || "Custom marker";

    const marker = L.marker(center, { icon: ICONS[iconKey] || ICONS.pin });
    marker.bindPopup(`
      <strong>${title}</strong><br/>
      Icon: ${iconKey}<br/>
      <div style="margin-top:6px">(${center.lat.toFixed(5)}, ${center.lng.toFixed(5)})</div>
    `);
    userMarkers.addLayer(marker);
    marker.openPopup();
    showToast("Marker added at map center.");
  });

  let measureMode = false;
  let measurePts = [];
  let measureLine = null;

  function setMeasureMode(on) {
    measureMode = on;
    measureToggle.classList.toggle("is-on", on);
    measureToggle.textContent = on ? "Measuring…" : "Start measuring";
    measureInfo.textContent = on ? "Click two points on the map." : "Click Start measuring to measure distance.";
    if (!on) measurePts = [];
  }

  measureToggle.addEventListener("click", () => setMeasureMode(!measureMode));
  measureClear.addEventListener("click", () => {
    measureLayer.clearLayers();
    measurePts = [];
    measureLine = null;
    measureInfo.textContent = "Cleared. Click two points on the map.";
  });

  let routeMode = false;
  let routePts = [];
  let routeLine = null;

  function routeTotalMeters(points) {
    let total = 0;
    for (let i = 1; i < points.length; i++) total += map.distance(points[i - 1], points[i]);
    return total;
  }

  function setRouteMode(on) {
    routeMode = on;
    routeToggle.classList.toggle("is-on", on);
    routeToggle.textContent = on ? "Route ON" : "Start route";
    routeInfo.textContent = on ? "Click multiple points on the map." : "Click Start route to draw a route.";
  }

  routeToggle.addEventListener("click", () => setRouteMode(!routeMode));
  routeClear.addEventListener("click", () => {
    routeLayer.clearLayers();
    routePts = [];
    routeLine = null;
    routeInfo.textContent = "Cleared. Click multiple points on the map.";
  });

  map.on("click", (e) => {
    if (measureMode) {
      measurePts.push(e.latlng);
      L.circleMarker(e.latlng, { radius: 5 }).addTo(measureLayer);

      if (measurePts.length === 2) {
        const d = map.distance(measurePts[0], measurePts[1]);
        if (measureLine) measureLayer.removeLayer(measureLine);
        measureLine = L.polyline(measurePts).addTo(measureLayer);
        measureInfo.textContent = `Distance: ${formatDistance(d)}`;
        showToast(`Distance: ${formatDistance(d)}`);
        measurePts = [];
      } else {
        measureInfo.textContent = "Select the second point…";
      }
    }

    if (routeMode) {
      routePts.push(e.latlng);
      L.circleMarker(e.latlng, { radius: 4 }).addTo(routeLayer);

      if (!routeLine) routeLine = L.polyline(routePts).addTo(routeLayer);
      else routeLine.setLatLngs(routePts);

      const total = routeTotalMeters(routePts);
      routeInfo.textContent = `Points: ${routePts.length} • Total: ${formatDistance(total)}`;
    }
  });

  async function geocode(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
  }

  async function doSearch() {
    const q = searchInput.value.trim();
    if (!q) return;

    try {
      setGeoStatus("Searching…", "warn");
      const r = await geocode(q);
      if (!r) {
        setGeoStatus("No results found.", "warn");
        showToast("No results found.");
        return;
      }
      setGeoStatus("Search result loaded.", "ok");
      const marker = L.marker([r.lat, r.lng], { icon: ICONS.pin }).addTo(userMarkers);
      marker.bindPopup(`<strong>Search result</strong><br/>${r.display}`).openPopup();
      map.setView([r.lat, r.lng], 16);
    } catch (e) {
      setGeoStatus("Search failed.", "warn");
      showToast("Search failed (network).");
    } finally {
      if (userLatLng) setGeoStatus(`Lat ${userLatLng.lat.toFixed(5)} • Lng ${userLatLng.lng.toFixed(5)}`, "ok");
    }
  }

  searchBtn.addEventListener("click", doSearch);
  searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });

  function refreshNearby() {
    nearbyList.innerHTML = "";
    if (!userLatLng) {
      nearbyList.innerHTML = `<div class="mono">Need your location to compute nearby places.</div>`;
      return;
    }

    const radius = Math.max(0, Number(nearbyRadiusInput.value) || 0);
    const nearby = placeMarkers
      .map(({ place, marker }) => ({ place, marker, d: userLatLng.distanceTo(L.latLng(place.lat, place.lng)) }))
      .filter(x => x.d <= radius)
      .sort((a, b) => a.d - b.d);

    if (nearby.length === 0) {
      nearbyList.innerHTML = `<div class="mono">No saved places within ${radius} m.</div>`;
      return;
    }

    nearby.forEach(({ place, marker, d }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = `${place.name} • ${formatDistance(d)}`;
      btn.addEventListener("click", () => {
        map.setView([place.lat, place.lng], 16);
        marker.openPopup();
      });
      nearbyList.appendChild(btn);
    });
  }

  nearbyRefreshBtn.addEventListener("click", refreshNearby);
  nearbyRadiusInput.addEventListener("change", refreshNearby);
};
