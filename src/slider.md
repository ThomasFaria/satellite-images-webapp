---
title: slider
---

<!-- ```js
import {require} from "npm:d3-require";
var sideBySide = require('leaflet-side-by-side')
console.log(sideBySide)
``` -->

<!-- <link rel="modulepreload" href="./leaflet-side-by-side.js"> -->

```js

const div = display(document.createElement("div"));
div.style = "height: 400px;";

const map = L.map(div)
  .setView([51.505, -0.09], 13);

// Create map panes
map.createPane('left');
map.createPane('right');

var openstreetmap = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  pane: 'left',
})
  .addTo(map);

var googleSat =L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    pane: 'right',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

L.marker([51.5, -0.09])
  .addTo(map)
  .bindPopup("A nice popup<br> indicating a point of interest.")
  .openPopup();
console.log("run side by side", L.control.sideBySide)
L.control.sideBySide(openstreetmap, googleSat).addTo(map);
```