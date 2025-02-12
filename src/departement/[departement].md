```js
// Get the department from the URL parameter
const department = new URL(window.location.href).pathname.split('/').pop();
console.log(`The current department is ${department}`);
```

```js
// Fonction pour formater le nom du département (première lettre en majuscule)
function formatdepartmentName(nom) {
  return nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase();
}
// Crée un élément h1 avec le nom du département
const titre = html`<h1>Informations géographiques : ${formatdepartmentName(department)}</h1>`;
display(titre);
```

```js
import {loadDepartmentGeom, loadDepartmentLevel, loadDepartmentEvol} from "../components/loaders.js";
import {getConfig} from "../components/config.js";
import {getOSM, getOSMDark, getMarker, getSatelliteImages, getPredictions, getClusters} from "../components/map-layers.js";
```


```js
const configg = getConfig(department);
const geom = await loadDepartmentGeom(department);
const level = await loadDepartmentLevel(department);
const evol = await loadDepartmentEvol(department);
```

```js
configg
```

```js
{
  'OpenStreetMap clair': OSM['OpenStreetMap clair'],
  'OpenStreetMap sombre': OSMDark['OpenStreetMap sombre'],
  }

```

```js
geom
```

```js
PREDICTIONS
```

```js
Inputs.table(evol)
```


## Analyse des îlots


```js

// Initialisation de la carte Leaflet
const mapDiv = display(document.createElement("div"));
mapDiv.style = "height: 600px; width: 100%; margin: 0 auto;";

// Initialiser la carte avec la position centrale du département
const map2 = L.map(mapDiv, {
            center: center,
            zoom: 17,           
            maxZoom: 21 //(or even higher)
        });



// Ajout d'une couche de base OpenStreetMap
const OSM = getOSM();

// Ajout d'une couche de base sombre pour le mode sombre
const OSMDark  = getOSMDark();

const marker = getMarker(center);

const PLEIADES =  getSatelliteImages(configg);

const PREDICTIONS =  getPredictions(configg);


const BORDERS = getClusters(geom);


// Ajout de la couche de base par défaut
OSM['OpenStreetMap clair'].addTo(map2);

// Ajouter le marqueur à la carte
marker.addTo(map2);


L.control.layers({
  ...OSM,
  ...OSMDark,
  ...PLEIADES,
  },{
  ...PREDICTIONS,
  ...BORDERS,
}).addTo(map2);

```




```js
// Importation de Leaflet depuis npm pour gérer la carte
import * as L from "npm:leaflet";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.6.1/dist/d3.min.js";
import { calculateQuantiles, getColor, createStyle, onEachFeature, getWMSTileLayer,createGeoJsonLayer,updateLegend,getIlotCentroid,createIlotBoundariesLayer} from "../utils/fonctions.js";
import { quantileProbs, colorScales, departmentConfig } from '../utils/config.js';
```

```js
const files = [
  {id: "mayotte", file: FileAttachment("../data/clusters_statistics_mayotte.json")},
  {id: "reunion", file: FileAttachment("../data/clusters_statistics_reunion.json")},
  {id: "guadeloupe", file: FileAttachment("../data/clusters_statistics_guadeloupe.json")}
]
// Trouve le fichier correspondant au département
const selec = files.find(f => f.id === department);
const statistics = await selec.file.json();
```

```js
// Choix du département Mayotte
const config = departmentConfig[department];
const { name, availableYears } = config;

// Initialisation de la carte Leaflet
const mapDiv = display(document.createElement("div"));
mapDiv.style = "height: 600px; width: 100%; margin: 0 auto;";

// Initialiser la carte avec la position centrale du département
const map = L.map(mapDiv, {
            center: center,
            zoom: 17,           
            maxZoom: 21 //(or even higher)
        });

// Créer un icône personnalisé pour le marqueur
const crossIcon = L.divIcon({
  className: 'custom-cross-icon',
  html: '<div style="width: 10px; height: 10px; background-color: black; border: 2px solid white; border-radius: 50%;"></div>',
  iconSize: [10, 10], // Taille de l'icône
  iconAnchor: [5, 5]  // Point d'ancrage de l'icône (centre de l'icône)
});

// Ajouter le marqueur à la carte
L.marker(center, { icon: crossIcon }).addTo(map);
// Ajout d'une couche de base OpenStreetMap
const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 21,
});

// Ajout d'une couche de base sombre pour le mode sombre
const darkBaseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
  subdomains: 'abcd',
    maxZoom: 21,
});

// Ajouter la couche de base par défaut
baseLayer.addTo(map);

// Exemple d'utilisation :
const ilotBoundariesLayer = createIlotBoundariesLayer(statistics);
map.addLayer(ilotBoundariesLayer);

// Définition des couches de base
const baseLayers = {
  'OpenStreetMap clair': baseLayer,
  'OpenStreetMap sombre': darkBaseLayer,
};
```

```js
const overlays = {};
// Adding layers for available years
availableYears.forEach((year, index) => {
  const pleiadesLayer = getWMSTileLayer(`${name}_${year}`, year);
  baseLayers[`Pleiades ${year}`] = pleiadesLayer;
  
  const predictionLayer = getWMSTileLayer(`${name}_PREDICTIONS_${year}`, null, `contour_${index+1}`);
  overlays[`Prédiction ${year}`] = predictionLayer;
});
// Labels and indicators with associated units
const labels = [
  { indicator: 'pct_building_2023', label: 'Pourcentage de bâti 2023', colorScale: 'redScale', unit: '%' },
  { indicator: 'building_2023', label: 'Surface bâti', colorScale: 'greenScale', unit: 'm²' },
  { indicator: 'area_building_change_absolute', label: 'Variation de Surface absolue', colorScale: 'blueScale', unit: 'm²' },
  { indicator: 'area_building_change_relative', label: 'Variation de Surface relative', colorScale: 'yellowScale', unit: '%' }
];

// Assuming statistics, map, availableYears, name, quantileProbs, and colorScales are already defined

// Create and add GeoJSON layers
// let isFirstLayer = true;
for (const { indicator, label, colorScale, unit } of labels) {
  const geojsonLayer = createGeoJsonLayer(statistics, indicator, label, quantileProbs, colorScales[colorScale], unit);
  overlays[label] = geojsonLayer;

  // Add only the first layer to the map by default
  // if (isFirstLayer) {
  //   geojsonLayer.addTo(map);
  //   isFirstLayer = false;
  // }
}
 overlays["Contours des îlots"] = ilotBoundariesLayer.addTo(map);

```

```js
// Layer controls
L.control.layers(baseLayers, overlays).addTo(map);

// Legend setup and event handlers
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  return L.DomUtil.create('div', 'info legend');
};

// Function to update the legend based on the currently active layer
function updateLegendForLayer(layerName) {
  const selectedIndicator = labels.find(label => label.label === layerName);
  if (selectedIndicator) {
    // Calculate quantiles for the selected indicator
    const quantiles = calculateQuantiles(
      statistics.features.map(f => f.properties[selectedIndicator.indicator]), 
      quantileProbs
    );
    // Update the legend with the correct information and units
    legend.getContainer().innerHTML = updateLegend(
      selectedIndicator, 
      colorScales[selectedIndicator.colorScale], 
      quantiles, 
      selectedIndicator.unit
    ).innerHTML;
  }
}

// Check if the default layer is active and add the legend accordingly
if (map.hasLayer(overlays['Pourcentage de bâti 2023'])) {
  legend.addTo(map);
  updateLegendForLayer('Pourcentage de bâti 2023');
}

// Event handler for adding an overlay layer
map.on('overlayadd', function (eventLayer) {
  if (labels.some(label => label.label === eventLayer.name)) {
    legend.addTo(map);
    updateLegendForLayer(eventLayer.name);
  }
});

// Event handler for removing an overlay layer
map.on('overlayremove', function (eventLayer) {
  if (labels.some(label => label.label === eventLayer.name)) {
    map.removeControl(legend);
  }
});

// const stats = view(
//   Inputs.select(
//     labels.map(label => label.label),
//     {unique: true, label: "Statistiques d'évolutions"}
//   )
// );

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
const center = getIlotCentroid(
    statistics,
    search[0]?.depcom_2018 || placeholder_commune,
    search[0]?.code || placeholder_ilot
  )
```


```js
console.log(search[0])
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
<!-- 
```js
Inputs.table(
  search,
  {
      columns: ['depcom_2018', 'code', 'building_2023', 'pct_building_2023','area_building_change_absolute','area_building_change_relative'],
      header: {
        depcom_2018: 'Code Commune',
        code: 'Code Îlot',
        building_2023: 'Surface Bâtie 2023 (m²)',
        pct_building_2023: '% Bâti 2023',
        area_building_change_absolute: 'écart absolu',
        area_building_change_relative:'écart relatif'
      },
      width: {
        depcom_2018: 120,
        code: 100,
        building_2023: 150,
        pct_building_2023: 120
      },
      format: {
        building_2023: x => x + ' m²',
        pct_building_2023: x => x + ' %',
        area_building_change_absolute: x => x + ' m²',
        area_building_change_relative: x => x + ' %',
      },
      rows: 10
  }
)
```  -->