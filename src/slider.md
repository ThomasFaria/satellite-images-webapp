---
title: slider
---

```js
import * as L from "npm:leaflet";
//import { L } from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
window.L = L; // Rendre 'L' global

// Importer les styles CSS nécessaires
html`<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />`
html`<link rel="stylesheet" href="https://unpkg.com/leaflet-side-by-side@2.0.1/leaflet-side-by-side.css" />`
import L.control.sideBySide from "https://unpkg.com/leaflet-side-by-side@2.2.0/index.js"
```

```js
// Initialisation de la carte Leaflet
const mapDiv = display(document.createElement("div"));
mapDiv.style = "height: 600px; width: 100%; margin: 0 auto;";

// Initialiser la carte avec la position centrale du département
const center = [-12.78081553844026, 45.227656507434695];
const map = L.map(mapDiv).setView(center, 14,10.4);
```

```js
// Couche "Avant"
const layerBefore = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Couche "Après"
const layerAfter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
  subdomains: 'abcd',
  maxZoom: 19,
}).addTo(map);

// Ajouter le slider
const sideBySide = L.control.sideBySide(layerBefore, layerAfter).addTo(map);
```
