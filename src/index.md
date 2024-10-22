---
toc: false
---

<div class="hero">
  <h1>CRaTT</h1>
  <h2> Petite application pour observer les performance des algorithmes de segmentation </h2>
</div>



```js
// Importation de Leaflet depuis npm pour gérer la carte
import * as L from "npm:leaflet";
```

```js
// Configuration des départements avec des coordonnées spécifiques et des couches supplémentaires
const departementConfig = {
  mayotte: {
    name: 'MAYOTTE',
    center: [-12.78081553844026, 45.227656507434695],
    availableYears: ['2023'],
    extraLayers: [
      {
        name: 'Création 2020-2023',
        layer: 'creation_MAYOTTE_2020_2023',
      },
    ],
  },
};

// Fonction pour obtenir une couche WMS depuis GeoServer
const getWMSTileLayer = (layer, opacity = 1) => {
  const url = 'https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms';
  const geoserverWorkspace = 'dirag';
  
  return L.tileLayer.wms(url, {
    layers: `${geoserverWorkspace}:${layer}`,
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    opacity: opacity,
    attribution: 'GeoServer',
  });
};
```

```js
// Choix du département Mayotte
const departement = 'mayotte';
const config = departementConfig[departement];

const { name, center, availableYears, extraLayers } = config;

// Créer une nouvelle div pour la carte
const mapDiv = display(document.createElement("div"));
mapDiv.style = "height: 400px;";


// Initialiser la carte avec la position centrale du département
const map = L.map(mapDiv).setView(center, 14);

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

// Création des groupes de couches de base et superposées
const baseLayers = {
  'Clair': baseLayer,
  'Sombre': darkBaseLayer,
};

const overlays = {};

// Ajout de la couche "Ilots"
const ilotsLayer = getWMSTileLayer(`${name}_ILOTS`);
ilotsLayer.addTo(map);
overlays['Ilots'] = ilotsLayer;

// Ajout des couches pour les années disponibles
for (const year of availableYears) {
  const pleiadesLayer = getWMSTileLayer(`${name}_${year}`);
  overlays[`PLEIADES ${year}`] = pleiadesLayer;
  
  const predictionLayer = getWMSTileLayer(`${name}_PREDICTIONS_${year}`);
  overlays[`Prédiction ${year}`] = predictionLayer;
}

// Ajout des couches supplémentaires
for (const { name: layerName, layer } of extraLayers) {
  const extraLayer = getWMSTileLayer(layer);
  overlays[layerName] = extraLayer;
}

// Ajout du contrôle de couches à la carte
L.control.layers(baseLayers, overlays).addTo(map);
map;
```




<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
