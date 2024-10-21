---
title: Îlots sur fond d'images satellites
---
```js
test2
```


```js
import deck from "npm:deck.gl";
// import {_WMSLayer as WMSLayer} from '@deck.gl/geo-layers';
```

```js
const {DeckGL, AmbientLight, GeoJsonLayer, TileLayer, BitmapLayer, _WMSLayer, LightingEffect, PointLight} = deck;

```

```js
const test2 = FileAttachment("./data/clusters_statistics.json").json();
```

<div class="card" style="margin: 0 -1rem;">


<figure style="max-width: none; position: relative;">
  <div id="container" style="border-radius: 8px; overflow: hidden; background: rgb(18, 35, 48); height: 800px; margin: 1rem 0; "></div>
  <div style="position: absolute; top: 1rem; right: 1rem; filter: drop-shadow(0 0 4px rgba(0,0,0,.5));">${colorLegend}</div>
</figure>

</div>

<div id="layerControl">
  <label><input type="checkbox" id="osmLayer" checked> OpenStreetMap</label><br>
  <label><input type="checkbox" id="pleiadesLayer" checked> Images Pléïades</label><br>
  
  <label for="geojsonSelect">Choisissez la couche GeoJson :</label>
  <select id="geojsonSelect">
    <option value="geojsonLayer2" selected>Pourcentage de bâtiments par îlots en 2023</option>
    <option value="geojsonLayer">Variations de bâti relative (%) entre 2022 et 2023</option>
    <option value="geojsonLayer1">Variations de bâti absolue (m²) entre 2022 et 2023</option>
  </select>
</div>

```js
const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

const colorLegend = Plot.plot({
  margin: 0,
  marginTop: 20,
  width: 180,
  height: 35,
  style: "color: white;",
  x: {padding: 0, axis: null},
  marks: [
    Plot.cellX(colorRange, {fill: ([r, g, b]) => `rgb(${r},${g},${b})`, inset: 0.5}),
    Plot.text(["Fewer"], {frameAnchor: "top-left", dy: -12}),
    Plot.text(["More"], {frameAnchor: "top-right", dy: -12})
  ]
});
```

```js
const initialViewState = {
  longitude: 45.14,
  latitude: -12.79,
  zoom: 11,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -5
};
```

```js
function getTooltip({object}) {
  if (!object) return null;
  return {
    html: `
    <div><b>Pourcentage de bâti (%)</b></div>
    <div>${Math.round(object.properties.pct_building_2023 * 100)}%</div>
    <div><b>Variation absolue de bâtis (m²)</b></div>
    <div>${Math.round(object.properties.area_building_change_absolute)} / m²</div>
    <div><b>Variation relative de bâtis (%)</b></div>
    <div>${Math.round(object.properties.area_building_change_relative * 100)}%</div>
    `,
    style: {
      backgroundColor: '#ffffff',
      color: '#000000',
      fontSize: '0.8em',
      padding: '5px',
      borderRadius: '5px',
      boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.5)'
    }
  };
}
```

```js
const effects = [
  new LightingEffect({
    ambientLight: new AmbientLight({color: [255, 255, 255], intensity: 1.0}),
    pointLight: new PointLight({color: [255, 255, 255], intensity: 0.8, position: [-0.144528, 49.739968, 80000]}),
    pointLight2: new PointLight({color: [255, 255, 255], intensity: 0.8, position: [-3.807751, 54.104682, 8000]})
  })
];
```

```js
const deckInstance = new DeckGL({
  container,
  initialViewState: initialViewState,
  getTooltip: getTooltip,
  effects: effects,
  controller: true
});

// clean up if this code re-runs
invalidation.then(() => {
  deckInstance.finalize();
  container.innerHTML = "";
});
```

```js
const osmLayer = new TileLayer({
  id: 'TileLayer',
  data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
  maxZoom: 19,
  minZoom: 0,
  renderSubLayers: props => {
    const {boundingBox} = props.tile;

    return new BitmapLayer(props, {
      data: null,
      image: props.data,
      bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
    });
  },
  pickable: true
});
```

```js
const geojsonLayer = new GeoJsonLayer({
  id: "geojson",
  data: test2,
  opacity: 0.1,
  lineWidthMinPixels: 1,
  getLineColor: [60, 60, 60],
  getFillColor: f => COLOR_SCALE(f.properties.area_building_change_relative),
  pickable: true,
});
```

```js
const geojsonLayer1 = new GeoJsonLayer({
  id: "geojson",
  data: test2,
  opacity: 0.1,
  lineWidthMinPixels: 1,
  getLineColor: [60, 60, 60],
  getFillColor: f => COLOR_SCALE_1(f.properties.area_building_change_absolute),
  pickable: true,
});
```

```js
const geojsonLayer2 = new GeoJsonLayer({
  id: "geojson",
  data: test2,
  opacity: 0.1,
  lineWidthMinPixels: 1,
  getLineColor: [60, 60, 60],
  getFillColor: f => COLOR_SCALE_2(f.properties.pct_building_2023),
  pickable: true,
});
```

```js
const pleiadesLayer = new _WMSLayer({
  id: "pleiades",
  data: 'https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms',
  serviceType: 'wms',
  layers: ['dirag:MAYOTTE_2023']
});
```

```js
function updateLayers() {
  const layers = [];
  
  // Vérifie l'état de la case à cocher OpenStreetMap
  if (document.getElementById('osmLayer').checked) {
    layers.push(osmLayer);
  }
  
  // Vérifie l'état de la case à cocher Pleiades
  if (document.getElementById('pleiadesLayer').checked) {
    layers.push(pleiadesLayer);
  }

  // Récupère la valeur sélectionnée du menu déroulant
  const selectedGeoJsonLayer = document.getElementById('geojsonSelect').value;
  
  // Ajoute la couche GeoJsonLayer correspondante
  if (selectedGeoJsonLayer === 'geojsonLayer2') {
    layers.push(geojsonLayer2);
  } else if (selectedGeoJsonLayer === 'geojsonLayer') {
    layers.push(geojsonLayer);
  } else if (selectedGeoJsonLayer === 'geojsonLayer1') {
    layers.push(geojsonLayer1);
  }
  
  // Mettre à jour les couches dans DeckGL
  deckInstance.setProps({ layers });
}
```

```js
document.addEventListener('DOMContentLoaded', () => {
  // Sélectionnez les cases à cocher
  const osmLayerCheckbox = document.getElementById('osmLayer');
  const geojsonSelectChoice = document.getElementById('geojsonSelect');
  const pleiadesLayerCheckbox = document.getElementById('pleiadesLayer');

  // Vérifiez que les éléments existent avant de leur ajouter des écouteurs d'événements
  if (osmLayerCheckbox && geojsonSelectChoice && pleiadesLayerCheckbox) {
    osmLayerCheckbox.addEventListener('change', updateLayers);
    geojsonSelectChoice.addEventListener('change', updateLayers);
    pleiadesLayerCheckbox.addEventListener('change', updateLayers);

    // Initialiser les couches lors du chargement
    updateLayers();
  } else {
    console.error('Un ou plusieurs éléments de contrôle des couches sont manquants dans le DOM.');
  }
});
```

```js
deckInstance.setProps({
  // layers: [
  //   // OpenStreetMap tile layer
  //   new TileLayer({
  //   id: 'TileLayer',
  //   data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
  //   maxZoom: 19,
  //   minZoom: 0,
  //   renderSubLayers: props => {
  //     const {boundingBox} = props.tile;

  //     return new BitmapLayer(props, {
  //       data: null,
  //       image: props.data,
  //       bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
  //     });
  //   },
  //   pickable: true
  //   }),

  //   new _WMSLayer({
  //     data: 'https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms',
  //     serviceType: 'wms',
  //     layers: ['dirag:MAYOTTE_2023']
  //   }),

  //   new GeoJsonLayer({
  //     id: "geojson",
  //     data: test2,
  //     opacity: 0.1,
  //     lineWidthMinPixels: 1,
  //     getLineColor: [60, 60, 60],
  //     getFillColor: f => COLOR_SCALE(f.properties.area_building_change_relative),
  //     pickable: true
  //   }),
  // ],
  layers: [
    osmLayer,
    pleiadesLayer,
    geojsonLayer2]
});
```

```js
const t = (function* () {
  const duration = 1000;
  const start = performance.now();
  const end = start + duration;
  let now;
  while ((now = performance.now()) < end) yield d3.easeCubicInOut(Math.max(0, (now - start) / duration));
  yield 1;
})();
```

```js
const geojsonData = test2.features;
```

```js
const valuesForLayer = geojsonData.map(f => f.properties.area_building_change_relative);
const minValueLayer = Math.min(valuesForLayer);
const maxValueLayer = Math.max(valuesForLayer);

const valuesForLayer1 = geojsonData.map(f => f.properties.area_building_change_absolute);
const minValueLayer1 = Math.min(valuesForLayer1);
const maxValueLayer1 = Math.max(valuesForLayer1);

const valuesForLayer2 = geojsonData.map(f => f.properties.pct_building_2023);
const minValueLayer2 = Math.min(valuesForLayer2);
const maxValueLayer2 = Math.max(valuesForLayer2);
```

```js
// Utiliser le choix de variable pour créer un COLOR_SCALE
const COLOR_SCALE = d3.scaleThreshold()
  .domain([minValueLayer, maxValueLayer])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38]
  ]);
```

```js
const COLOR_SCALE_1 = d3.scaleThreshold()
  .domain([minValueLayer1, maxValueLayer1])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38]
  ]);
```

```js
const COLOR_SCALE_2 = d3.scaleThreshold()
  .domain([minValueLayer2, maxValueLayer2])
  .range([
    [255, 255, 204],
    [254, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60]
  ]);
```