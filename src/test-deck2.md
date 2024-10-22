---
title: Îlots sur fond d'images satellites
---


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
  <div id="container" style="border-radius: 8px; overflow: hidden; background: rgb(18, 35, 48); height: 800px; margin: 1rem 0;"></div>
  <div id="legendContainer" style="position: absolute; top: 1rem; right: 1rem; filter: drop-shadow(0 0 4px rgba(0,0,0,.5));"></div>
</figure>

</div>

<div id="layerControl">
  <label><input type="checkbox" id="osmLayer" checked> OpenStreetMap</label><br>
  <label><input type="checkbox" id="pleiadesLayer2023" checked> Images Pléïades 2023</label><br>
  
  <label for="geojsonSelect">Choisissez la statistique par îlot à afficher :</label>
  <select id="geojsonSelect">
    <option value="geojsonLayer2" selected>Pourcentage de bâtiments par îlots en 2023</option>
    <option value="geojsonLayer">Variations de bâti relative (%) entre 2022 et 2023</option>
    <option value="geojsonLayer1">Variations de bâti absolue (m²) entre 2022 et 2023</option>
  </select>
</div>

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
    <div>${Math.round(object.properties.pct_building_2023)}%</div>
    <div><b>Variation absolue de bâtis (m²)</b></div>
    <div>${Math.round(object.properties.area_building_change_absolute)} / m²</div>
    <div><b>Variation relative de bâtis (%)</b></div>
    <div>${Math.round(object.properties.area_building_change_relative)}%</div>
    <div><b>Cluster ID</b></div>
    <div>${object.id}</div>
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
const geojsonData = test2.features;
```

```js
const valuesForLayer = geojsonData.map(f => f.properties.area_building_change_relative);
const minValueLayer = Math.round(Math.min(...valuesForLayer));
const maxValueLayer = Math.round(Math.max(...valuesForLayer));

const valuesForLayer1 = geojsonData.map(f => f.properties.area_building_change_absolute);
const minValueLayer1 = Math.round(Math.min(...valuesForLayer1));
const maxValueLayer1 = Math.round(Math.max(...valuesForLayer1));

const valuesForLayer2 = geojsonData.map(f => f.properties.pct_building_2023);
const minValueLayer2 = Math.round(Math.min(...valuesForLayer2));
const maxValueLayer2 = Math.round(Math.max(...valuesForLayer2));
```

```js
function generateEqualIntervals(min, max, intervals) {
  const step = (max - min) / (intervals - 1);
  return Array.from({ length: intervals }, (_, i) => min + i * step);
}
```

```js
const numIntervals = 13;
const numIntervals1 = 5;

const domainValues = generateEqualIntervals(minValueLayer, maxValueLayer, numIntervals);
const domainValues1 = generateEqualIntervals(minValueLayer1, maxValueLayer1, numIntervals1);
const domainValues2 = generateEqualIntervals(minValueLayer2, maxValueLayer2, numIntervals);
```

```js
const COLOR_SCALE = d3.scaleLinear()
  .domain(domainValues)
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

const COLOR_SCALE_1 = d3.scaleLinear()
  .domain(domainValues1)
  .range([
    [255, 255, 204],
    [254, 200, 150],
    [253, 150, 100],
    [255, 100, 20],
    [255, 0, 0]
  ]);

const COLOR_SCALE_2 = d3.scaleLinear()
  .domain(domainValues2)
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
// Créer un conteneur pour afficher les valeurs
const outputContainer = document.createElement('div');
outputContainer.id = 'output';
document.body.appendChild(outputContainer);

// Itérer à travers les features et afficher pct_building_2023
test2.features.forEach((feature, index) => {
  const value = feature.properties.area_building_change_relative;
  
  // Afficher dans la console
  console.log(`Feature ${index + 1}: Pourcentage de bâti = ${value}%`);

  // Afficher dans le conteneur HTML
  const p = document.createElement('p');
  p.textContent = `Feature ${index + 1}: Pourcentage de bâti = ${value}%`;
  outputContainer.appendChild(p);
});

```

```js
function createColorLegend(colorScale, minValue, maxValue) {
  return Plot.plot({
    margin: 0,
    marginTop: 20,
    width: 180,
    height: 35,
    style: "color: white;",
    x: { padding: 0, axis: null },
    marks: [
      Plot.cellX(colorScale.range(), { fill: ([r, g, b]) => `rgb(${r},${g},${b})`, inset: 0.5 }),
      Plot.text([minValue.toFixed(2)], { frameAnchor: "top-left", dy: -12 }),
      Plot.text([maxValue.toFixed(2)], { frameAnchor: "top-right", dy: -12 })
    ]
  });
}
```

```js
const COLOR_LEGEND = createColorLegend(COLOR_SCALE, minValueLayer, maxValueLayer);
const COLOR_LEGEND_1 = createColorLegend(COLOR_SCALE_1, minValueLayer1, maxValueLayer1);
const COLOR_LEGEND_2 = createColorLegend(COLOR_SCALE_2, minValueLayer2, maxValueLayer2);
```

```js
function showLegendForLayer(layerId) {
  const legendContainer = document.getElementById('legendContainer');
  legendContainer.innerHTML = ''; // Efface la légende précédente
  
  // Déclare une variable pour le titre de la légende
  let legendTitle = '';
  
  // Légende à afficher en fonction de la couche sélectionnée
  if (layerId === 'geojsonLayer') {
    legendTitle = 'Variation relative de bâtis (%) entre 2022 et 2023';
    legendContainer.appendChild(COLOR_LEGEND);
  } else if (layerId === 'geojsonLayer1') {
    legendTitle = 'Variation absolue de bâtis (m²) entre 2022 et 2023';
    legendContainer.appendChild(COLOR_LEGEND_1);
  } else if (layerId === 'geojsonLayer2') {
    legendTitle = 'Pourcentage de bâtiments par îlots en 2023';
    legendContainer.appendChild(COLOR_LEGEND_2);
  }
  
  // Crée un élément pour le titre de la légende
  const titleElement = document.createElement('div');
  titleElement.textContent = legendTitle;
  titleElement.style.fontWeight = 'bold';
  titleElement.style.marginBottom = '5px';
  
  // Ajoute le titre au conteneur de légende
  legendContainer.prepend(titleElement);
}
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
  id: "geojson1",
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
  id: "geojson2",
  data: test2,
  opacity: 0.1,
  lineWidthMinPixels: 1,
  getLineColor: [60, 60, 60],
  getFillColor: f => COLOR_SCALE_2(f.properties.pct_building_2023),
  pickable: true,
});
```

```js
const pleiadesLayer2023 = new _WMSLayer({
  id: "pleiades2023",
  data: 'https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms',
  serviceType: 'wms',
  layers: ['dirag:MAYOTTE_2023']
});
```

<!-- ```js
const pleiadesLayer2022 = new _WMSLayer({
  id: "pleiades2022",
  data: 'https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms',
  serviceType: 'wms',
  layers: ['dirag:MAYOTTE_2022']
});
``` -->

```js
function updateLayers() {
  const layers = [];
  
  // Vérifie l'état de la case à cocher OpenStreetMap
  if (document.getElementById('osmLayer').checked) {
    layers.push(osmLayer);
  }
  
  // Vérifie l'état de la case à cocher Pleiades
  if (document.getElementById('pleiadesLayer2023').checked) {
    layers.push(pleiadesLayer2023);
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

  // Afficher la bonne légende
  showLegendForLayer(selectedGeoJsonLayer);
}
```

```js
document.addEventListener('DOMContentLoaded', () => {
  // Sélectionnez les cases à cocher
  const osmLayerCheckbox = document.getElementById('osmLayer');
  const geojsonSelectChoice = document.getElementById('geojsonSelect');
  const pleiadesLayer2023Checkbox = document.getElementById('pleiadesLayer2023');

  // Vérifiez que les éléments existent avant de leur ajouter des écouteurs d'événements
  if (osmLayerCheckbox && geojsonSelectChoice && pleiadesLayer2023Checkbox) {
    osmLayerCheckbox.addEventListener('change', updateLayers);
    geojsonSelectChoice.addEventListener('change', updateLayers);
    pleiadesLayer2023Checkbox.addEventListener('change', updateLayers);

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
  //     new BitmapLayer(props, {
  //       data: null,
  //       image: props.data,
  //       bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
  //     });
  //   },
  //   pickable: true
  //   }),
  layers: [
    osmLayer,
    pleiadesLayer2023,
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


