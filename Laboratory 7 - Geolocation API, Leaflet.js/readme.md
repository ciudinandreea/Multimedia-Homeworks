# Laboratory - Geolocation and Interactive Maps with Leaflet.js

## Overview

This project demonstrates the integration of browser geolocation capabilities with interactive mapping using the Leaflet.js library. The application automatically detects the user's current location and displays it on an OpenStreetMap-based interactive map with a marker and accuracy circle. This showcases how to combine modern web APIs with third-party mapping libraries to create location-aware applications.

## What's Included

### HTML Structure
- Basic HTML5 document with viewport meta tag for mobile responsiveness
- Leaflet CSS (v1.9.4) loaded from unpkg CDN with integrity hash
- Leaflet JavaScript library (v1.9.4) loaded from unpkg CDN with integrity hash
- A `<div>` element with id `map` for the map container
- A CSS file for full-viewport map display
- JavaScript file for map initialization and geolocation logic

### Geolocation Implementation
- **Browser Geolocation API**: Uses `navigator.geolocation.getCurrentPosition()` to obtain user coordinates
- **Automatic positioning**: Retrieves latitude, longitude, and accuracy data from the device
- **Coordinate extraction**: Accesses `position.coords.latitude` and `position.coords.longitude`
- **Accuracy information**: Uses `position.coords.accuracy` (in meters) for visualization

### Map Configuration
- **Leaflet map instance**: Creates an interactive map centered on the user's location
- **Zoom level**: Set to 18 for a close, street-level view
- **Tile layer**: OpenStreetMap tiles loaded from `tile.openstreetmap.org`
- **Max zoom**: Configured to 19 for maximum detail
- **Attribution**: Custom attribution text in the tile layer

### Visual Elements
- **Location marker**: A pin marker placed at the user's exact coordinates
- **Accuracy circle**: A translucent green circle showing GPS accuracy radius
  - Border color: green
  - Fill color: rgba(62, 240, 62, 1) with 50% opacity
  - Radius: matches the position accuracy value in meters

### Styling
- **Full viewport display**: Map occupies entire browser window (100vw × 100vh)
- **Zero margins**: Body margin removed for seamless edge-to-edge display

## Current Features

The application requests the user's location permission, retrieves their current coordinates, and displays an interactive map centered on their position. A marker indicates the exact location while a semi-transparent green circle visualizes the accuracy range of the GPS reading. Users can interact with the map through standard controls (zoom, pan, drag).

---

## Exercises

Complete the following exercises to enhance the mapping application with additional features, interactivity, and practical functionality. Focus on creating a more useful location-based tool with various map interactions and data visualization.

---

## Exercises

Complete the following exercises to enhance the mapping application with additional features, interactivity, and practical functionality. Focus on creating a more useful location-based tool with various map interactions and data visualization.

- **Add error handling for geolocation**: Implement proper error handling for cases where:
  - User denies location permission
  - Geolocation is not supported by the browser
  - Location retrieval times out or fails
  - Display user-friendly messages for each scenario
  - *Hint: Use the second parameter (error callback) of `getCurrentPosition()` to handle errors*

- **Add custom marker icons**: Replace the default blue marker with custom icons for different purposes (home, work, favorite places). Allow users to choose icons when adding markers.
  - *Hint: Create custom icons with `L.icon()` specifying `iconUrl`, `iconSize`, and `iconAnchor` properties, then use them in `L.marker()` with the `icon` option*

- **Create a places database**: Build an array or object containing interesting locations (restaurants, landmarks, parks). Display these as markers with different colors or icons on the map.
  - *Hint: Loop through your array and create markers with `L.marker()` for each location, using different `L.icon()` configurations or `L.divIcon()` for colored markers*

- **Implement marker popups**: Add clickable popups to markers that display information when clicked:
  - Location name
  - Address or coordinates
  - Description or notes
  - Links to external resources (Google Maps, website)
  - *Hint: Use `marker.bindPopup()` with HTML content, or chain `.bindPopup().openPopup()` to show immediately*

- **Add distance measurement tool**: Create functionality to measure the distance between the user's location and clicked points on the map. Display the distance in both meters/kilometers and miles.
  - *Hint: Use `map.distance()` or the standalone `L.latLng().distanceTo()` method to calculate distances between coordinates*

- **Implement route drawing**: Allow users to click multiple points on the map to draw a route or path. Calculate and display the total distance of the drawn route.
  - *Hint: Use `map.on('click', callback)` to capture clicks, store coordinates in an array, and draw with `L.polyline()`. Calculate distances between consecutive points*

- **Add location search functionality**: Create a search input that allows users to search for addresses or place names (from the ones you created for the 3rd exercise) and navigate the map to those locations. To make it more interesting (although more difficult), consider using a geocoding service.
  - *Hint: Use `map.setView([lat, lng], zoom)` or `map.flyTo([lat, lng], zoom)` for smooth animation to the searched location*

- **Implement different map tile layers**: Add buttons or a dropdown to switch between different map styles:
  - OpenStreetMap (standard)
  - Satellite imagery
  - Terrain view
  - Dark mode / night map
  - Topographic map
  - *Hint: Create multiple `L.tileLayer()` instances and use `layer.addTo(map)` / `layer.remove()` to switch, or use `L.control.layers()` for built-in layer switching*

- **Create a "nearby places" feature**: When the map loads, display markers for nearby points of interest (using your custom database) within a certain radius of the user's location.
  - *Hint: Filter your places array using `L.latLng().distanceTo()` to check if each place is within your desired radius*

- **Implement geofencing alerts**: Define circular areas on the map and trigger alerts or actions when the user enters or exits these zones.
  - *Hint: Create circles with `L.circle()`, then in `watchPosition()` callback use `circle.getBounds().contains([lat, lng])` to check if user is inside*

- **Add layer controls**: Create a layer control panel that allows users to toggle different marker categories on and off (restaurants, parks, shops, etc.).
  - *Hint: Group markers into `L.layerGroup()` or `L.featureGroup()` for each category, then use `L.control.layers(baseLayers, overlays)` for the control panel*