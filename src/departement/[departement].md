```js
// Local imports
import {DepartmentMapVisualizer} from "../components/map.js";
import {loadDepartmentData} from "../components/loaders.js";
import {getConfig} from "../components/config.js";
import {getLayers, getIcon} from "../components/map-layers.js";
import {getClusterCentroid} from "../components/functions.js";
import {updateLegendForLayer} from "../components/map-utilities.js";

// npm imports
import * as L from "npm:leaflet";

```

```js
// Fonction pour formater le nom du département (première lettre en majuscule)
function formatDepartementName(nom) {
  return nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase();
}
// Crée un élément h1 avec le nom du département
const titre = html`<h1>Informations géographiques : ${formatDepartementName(department)}</h1>`;
display(titre);
```

```js
const department = new URL(window.location.href).pathname.split('/').pop();
const config = getConfig(department);

const div = display(document.createElement("div"));
div.style = "height: 600px; width: 100%;";
```

```js
```


```js
const statistics = await loadDepartmentData(department);
```




```js
layers
```

```js
const map = L.map(div).setView(config.center, 14);
const layers = getLayers(config, statistics);
const crossIcon = getIcon(config.center);

crossIcon.addTo(map);
layers['OpenStreetMap clair'].addTo(map)
// layers["Contours des îlots"].addTo(map)
L.control.layers(layers).addTo(map);
```

```js
  // Labels and indicators with associated units
  const labels = [
    { indicator: 'pct_building_2023', label: 'Pourcentage de bâti 2023', colorScale: 'redScale', unit: '%' },
    { indicator: 'building_2023', label: 'Surface bâti', colorScale: 'greenScale', unit: 'm²' },
    { indicator: 'area_building_change_absolute', label: 'Variation de Surface absolue', colorScale: 'blueScale', unit: 'm²' },
    { indicator: 'area_building_change_relative', label: 'Variation de Surface relative', colorScale: 'yellowScale', unit: '%' }
  ];
```

```js
// Legend setup and event handlers
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  return L.DomUtil.create('div', 'info legend');
};
```


```js
const statistics_props = statistics.features.map(f => ({
      depcom_2018: f.properties.depcom_2018,
      code: f.properties.code,
      building_2023: f.properties.building_2023,
      pct_building_2023: f.properties.pct_building_2023,
      area_building_change_absolute:f.properties.area_building_change_absolute,
      area_building_change_relative:f.properties.area_building_change_relative,
    }))
const placeholder_commune = statistics_props[0].depcom_2018
const placeholder_ilot = statistics_props[0].code
const placeholder_param = placeholder_commune + " " + placeholder_ilot
const search = view(
  Inputs.search(statistics_props, 
  {
    placeholder: placeholder_param,
    columns:["depcom_2018","code"]
  })
  );
```

<!-- # Bien séparer l'obtention de la valeur choisie de la définition du choix ! -->
```js
const center = getClusterCentroid(
    statistics,
    search[0]?.depcom_2018 || placeholder_commune,
    search[0]?.code || placeholder_ilot
  )
```


```js
const table = view(
  Inputs.table(search, {
    columns: ['depcom_2018', 'code', 'building_2023', 'pct_building_2023', 'area_building_change_absolute', 'area_building_change_relative'],
    header: {
      depcom_2018: 'Code Commune',
      code: 'Code Îlot',
      building_2023: 'Surface 2023 (m²)',
      pct_building_2023: 'Bâti 2023 (%)',
      area_building_change_absolute: 'Écart absolu (m²)',
      area_building_change_relative: 'Écart relatif (%)'
    },
    width: {
      depcom_2018: 120,
      code: 100,
      building_2023: 120,
      pct_building_2023: 90,
      area_building_change_absolute: 120,
      area_building_change_relative: 120
    },
    format: {
      building_2023: x => Math.round(x),
      pct_building_2023: x => Math.round(x),
      area_building_change_absolute: x => Math.round(x),
      area_building_change_relative: x => (Math.round(x * 10) / 10)
    },
    sort: {
      column: 'depcom_2018',
      reverse: false
    },
    rows: 10
  })
)
```
