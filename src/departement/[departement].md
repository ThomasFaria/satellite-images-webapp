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
import { calculateQuantiles, getColor, createStyle, onEachFeature, getWMSTileLayer,createGeoJsonLayer,updateLegend} from "../utils/fonctions.js";
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

```js
// Choix du département Mayotte
const config = departementConfig[departement];
const { name, center, availableYears } = config;

// Initialisation de la carte Leaflet
const mapDiv = display(document.createElement("div"));
mapDiv.style = "height: 400px; width: 100%; margin: 0 auto;";

// Initialiser la carte avec la position centrale du département
const map = L.map(mapDiv).setView(center, 14,10.4);

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

// Définition des couches de base
const baseLayers = {
  'Clair': baseLayer,
  'Sombre': darkBaseLayer,
};
```

```js
// Assuming statistics, map, availableYears, name, quantileProbs, and colorScales are already defined
const overlays = {};

const styleName = "contour_rouge"; // Defined in GeoServer

// Adding layers for available years
for (const year of availableYears) {
  const pleiadesLayer = getWMSTileLayer(`${name}_${year}`);
  overlays[`PLEIADES ${year}`] = pleiadesLayer;
  
  const predictionLayer = getWMSTileLayer(`${name}_PREDICTIONS_${year}`, styleName);
  overlays[`Prédiction ${year}`] = predictionLayer;
}

// Labels and indicators with associated units
const labels = [
  { indicator: 'pct_building_2023', label: 'Pourcentage de bâti 2023', colorScale: 'redScale', unit: '%' },
  { indicator: 'building_2023', label: 'Surface bâti', colorScale: 'greenScale', unit: 'm²' },
  { indicator: 'area_building_change_absolute', label: 'Variation de Surface absolue', colorScale: 'blueScale', unit: 'm²' },
  { indicator: 'area_building_change_relative', label: 'Variation de Surface relative', colorScale: 'yellowScale', unit: '%' }
];

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
const search_properties = Inputs.search(statistics.features.map(d => d.properties),{placeholder: "Retrouver îlot…"})
view(search_properties)
// D'abord, créons une liste d'options à partir de vos données
const ilotOptions = statistics.features.map(feature => ({
  depcom: feature.properties.depcom_2018,
  code: feature.properties.code,
  label: `${feature.properties.depcom_2018} - ${feature.properties.code}`
}));

// Maintenant, créons le sélecteur
const selectedIlot = 
  Inputs.select(ilotOptions, {
    label: "Sélectionnez un îlot",
    format: (ilot) => ilot.label,
    value: ilotOptions[0] // Sélectionne le premier îlot par défaut
  });

view(selectedIlot)
```

```js
// ée le tableau interactif
const table = view(
    Inputs.table(statistics.features.map(f => ({
      depcom_2018: f.properties.depcom_2018,
      code: f.properties.code,
      building_2023: f.properties.building_2023.toFixed(0),
      pct_building_2023: f.properties.pct_building_2023.toFixed(0),
      area_building_change_absolute:f.properties.area_building_change_absolute.toFixed(0),
      area_building_change_relative:f.properties.area_building_change_relative.toFixed(1),
    })), {
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
    },
    {placeholder: "Rechercher ilot.."}
    )
  );
table
```

```js
display(selectedIlot.value)
display(search_properties.value)
// gérer les couches àpartir de ça et filtrer la table
```

