---
title: Test Deck 2
---
```js

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

test2
```


<div class="card" style="margin: 0 -1rem;">

## Personal injury road collisions, 2022

<figure style="max-width: none; position: relative;">
  <div id="container" style="border-radius: 8px; overflow: hidden; background: rgb(18, 35, 48); height: 800px; margin: 1rem 0; "></div>
  <div style="position: absolute; top: 1rem; right: 1rem; filter: drop-shadow(0 0 4px rgba(0,0,0,.5));">${colorLegend}</div>
  <figcaption>Data: <a href="https://www.data.gov.uk/dataset/cb7ae6f0-4be6-4935-9277-47e5ce24a11f/road-safety-data">Department for Transport</a></figcaption>
</figure>

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
const deckInstance = new DeckGL({
  container,
  initialViewState: initialViewState,
  getTooltip,
  effects,
  controller: true
});

// clean up if this code re-runs
invalidation.then(() => {
  deckInstance.finalize();
  container.innerHTML = "";
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
// function getTooltip({object}) {
//   if (!object) return null;
//   const [lng] = object.area_building_change_relative;
//   return `latitude: ${lng.toFixed(2)}`;
// }

function getTooltip({object}) {
  return object && {
    html: `<h2>Message:</h2> <div>${object.message}</div>`,
    style: {
      backgroundColor: '#f00',
      fontSize: '0.8em'
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
deckInstance.setProps({
  layers: [
      // OpenStreetMap tile layer
    // new TileLayer({
    // id: 'TileLayer',
    // data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
    // maxZoom: 19,
    // minZoom: 0,
    // renderSubLayers: props => {
    //   const {boundingBox} = props.tile;

    //   return new BitmapLayer(props, {
    //     data: null,
    //     image: props.data,
    //     bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
    //   });
    // },
    // pickable: true
    // }),

    new _WMSLayer({
      data: 'https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms',
      serviceType: 'wms',
      layers: ['dirag:MAYOTTE_2023']
    }),

    new GeoJsonLayer({
      id: "geojson",
      data: test2,
      opacity: 0.2,
      lineWidthMinPixels: 1,
      getLineColor: [60, 60, 60],
      getFillColor: f => COLOR_SCALE(f.properties.area_building_change_relative),

    }),
  ]
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
const COLOR_SCALE = d3.scaleThreshold()
  .domain([-0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2])
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

```

```js

```

```js

```
