```js
// Local imports
import {DepartmentMapVisualizer} from "../components/map.js";
import {loadDepartmentData} from "../components/loaders.js";
import {getConfig} from "../components/config.js";
import {getLayers} from "../components/map-layers.js";

// npm imports
import * as L from "npm:leaflet";

```

```js
const department = new URL(window.location.href).pathname.split('/').pop();
const config = getConfig(department);

const div = display(document.createElement("div"));
div.style = "height: 600px; width: 1000px;";
```

```js
const map = L.map(div).setView(config.center, 14);
```



```js
const statistics = await loadDepartmentData(department);
```

```js
const layers = getLayers(config)
layers['Pléiades 2023'].addTo(map)

L.control.layers(layers, {collapsed: false}).addTo(map);


// // Add additional layers if needed
// addYearLayers(department, baseLayers);
// baseLayers['Prediction 2018'].addTo(map);

```

```js
layers

// Legend setup and event handlers
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  return L.DomUtil.create('div', 'info legend');
};
```