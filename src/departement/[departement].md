```js
// Get the department from the URL parameter
const departement = new URL(window.location.href).pathname.split('/').pop();
console.log(`The current department is ${departement}`);
```

```js
// Fonction pour formater le nom du département (première lettre en majuscule)
function formatDepartementName(nom) {
  return nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase();
}
// Crée un élément h1 avec le nom du département
const titre = html`<h1>Informations géographiques : ${formatDepartementName(departement)}</h1>`;
display(titre);
```


```js
// Importation de Leaflet depuis npm pour gérer la carte
import * as L from "npm:leaflet";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.6.1/dist/d3.min.js";
import { calculateQuantiles, getColor, createStyle, onEachFeature, getWMSTileLayer,createGeoJsonLayer,updateLegend,getIlotCentroid,createIlotBoundariesLayer} from "../utils/fonctions.js";
import { quantileProbs, colorScales, departementConfig } from '../utils/config.js';
```

```js
const files = [
  {id: "mayotte", file: FileAttachment("../data/clusters_statistics_mayotte.json")},
  {id: "reunion", file: FileAttachment("../data/clusters_statistics_reunion.json")},
]
// Trouve le fichier correspondant au département
const selec = files.find(f => f.id === departement);
const statistics = await selec.file.json();
```


<!-- # Reactivité du centre de la carte !! -->
```js
// Créer la liste des îlots et la trier
const ilots = statistics.features
  .map(feature => ({
    depcom: feature.properties.depcom_2018,
    code: feature.properties.code
  }))
  .sort((a, b) => {
    // Trier d'abord par depcom
    if (a.depcom !== b.depcom) {
      return a.depcom.localeCompare(b.depcom);
    }
    // Si les depcom sont identiques, trier par code
    return a.code.localeCompare(b.code);
  });

// Créer le sélecteur avec la liste triée
const selectedIlot = view(
  Inputs.select(ilots, {
    label: "Sélectionnez un îlot",
    format: d => `${d.depcom} - ${d.code}`,
    value: ilots[0]
  })
);

```
<!-- # Bien séparer l'obtention de la valeur choisie de la définition du choix ! -->
```js
const center = getIlotCentroid(
  statistics,
  selectedIlot.depcom,
  selectedIlot.code
)
```

```js
// Choix du département Mayotte
const config = departementConfig[departement];
const { name, availableYears } = config;

// Initialisation de la carte Leaflet
const mapDiv = display(document.createElement("div"));
mapDiv.style = "height: 600px; width: 100%; margin: 0 auto;";

// Initialiser la carte avec la position centrale du département
const map = L.map(mapDiv).setView(center, 17);

// Ajout d'une couche de base OpenStreetMap
const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
});

// Ajout d'une couche de base sombre pour le mode sombre
const darkBaseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
  subdomains: 'abcd',
  maxZoom: 19,
});

// Ajouter la couche de base par défaut
baseLayer.addTo(map);

// Exemple d'utilisation :
const ilotBoundariesLayer = createIlotBoundariesLayer(statistics);
map.addLayer(ilotBoundariesLayer);

// Définition des couches de base
const baseLayers = {
  'Clair': baseLayer,
  'Sombre': darkBaseLayer,
  "Contours des îlots": ilotBoundariesLayer
};
```

```js
const overlays = {};
// Adding layers for available years
const styleNames = ["contour_rouge","contour_bleu"]

availableYears.forEach((year, index) => {
  const pleiadesLayer = getWMSTileLayer(`${name}_${year}`);
  overlays[`PLEIADES ${year}`] = pleiadesLayer;
  
  const predictionLayer = getWMSTileLayer(`${name}_PREDICTIONS_${year}`, styleNames[index]);
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
let isFirstLayer = true;
for (const { indicator, label, colorScale, unit } of labels) {
  const geojsonLayer = createGeoJsonLayer(statistics, indicator, label, quantileProbs, colorScales[colorScale], unit);
  overlays[label] = geojsonLayer;

  // Add only the first layer to the map by default
  if (isFirstLayer) {
    geojsonLayer.addTo(map);
    isFirstLayer = false;
  }
}

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
```

```js
const statistics_props = statistics.features.map(f => ({
      depcom_2018: f.properties.depcom_2018,
      code: f.properties.code,
      building_2023: f.properties.building_2023.toFixed(0),
      pct_building_2023: f.properties.pct_building_2023.toFixed(0),
      area_building_change_absolute:f.properties.area_building_change_absolute.toFixed(0),
      area_building_change_relative:f.properties.area_building_change_relative.toFixed(1),
    }))
const search = view(Inputs.search(statistics_props, {placeholder: "chercher îlot…"}));
```

```js
const table = view(
  Inputs.table(statistics.features.map(f => ({
    depcom_2018: f.properties.depcom_2018,
    code: f.properties.code,
    building_2023: parseFloat(f.properties.building_2023),
    pct_building_2023: parseFloat(f.properties.pct_building_2023),
    area_building_change_absolute: parseFloat(f.properties.area_building_change_absolute),
    area_building_change_relative: parseFloat(f.properties.area_building_change_relative)
  })), {
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
      building_2023: x => x.toLocaleString('fr-FR', { maximumFractionDigits: 0 }),
      pct_building_2023: x => x.toLocaleString('fr-FR', { maximumFractionDigits: 0 }),
      area_building_change_absolute: x => x.toLocaleString('fr-FR', { maximumFractionDigits: 0 }),
      area_building_change_relative: x => x.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    },
    sort: {
      column: 'depcom_2018',
      reverse: false
    },
    rows: 10
  })
);
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