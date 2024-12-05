export function getLayers(config) {
  // Open street Map
  const OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
  });

  // Open street Map Dark mode
  const OSMDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
      subdomains: 'abcd',
  });

  // Prepare the layers object
  const layers = {
      'OpenStreetMap clair': OSM,
      'OpenStreetMap sombre': OSMDark
  };

  // Pleiades images
  config.availableYears.forEach((year) => {
      const pleiadesLayer = getWMSTileLayer(`${config.name}_${year}`, year);
      layers[`Pléiades ${year}`] = pleiadesLayer;
  });

  return layers;
}

export function getOverlay(config, statistics, labels) {
  overlays = {}

  // Predictions results
  config.availableYears.forEach((year, index) => {
    const predictionLayer = getWMSTileLayer(
        `${config.name}_PREDICTIONS_${year}`, 
        null, 
        index === 0 ? 'contour_rouge' : 'contour_bleu'
      );
    overlays[`Prédictions ${year}`] = predictionLayer;
  });

  // Create GeoJSON layers
  for (const { indicator, label, colorScale, unit } of labels) {
    const statsLayer = createGeoJsonLayer(statistics, indicator, label, quantileProbs, colorScales[colorScale], unit);
    overlays[label] = statsLayer;
  }

  // CLuster boundaries
  const clusterLayer = getClusterBoundariesLayer(statistics)
  overlays["Contours des îlots"] = clusterLayer
return overlays
}

    // Function to get a WMS Tile Layer
export function getWMSTileLayer(layer, year = null, styleName = null, opacity = 1) {
    const url = 'https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms';
    const geoserverWorkspace = 'dirag';
  
    // Initialize the wmsOptions object with the style parameter
    const wmsOptions = {
      layers: `${geoserverWorkspace}:${layer}`,
      format: 'image/png',
      transparent: true,
      version: '1.1.0',
      opacity: opacity,
    };
    if (styleName) {
      wmsOptions.styles = styleName;
    } else  {
      wmsOptions.attribution = `Pleiades &copy; CNES ${year}, Distribution AIRBUS DS`;
    }
    // Return the tile layer with the WMS options
    return L.tileLayer.wms(url, wmsOptions);
  }


export function getClusterBoundariesLayer(statistics) {
  const style = {
    fillColor: 'transparent',
    fillOpacity: 0,
    color: 'black',
    weight: 2,
    opacity: 1
  };

  const onEachFeature = (feature, layer) => {
    const communeCode = feature.properties.depcom_2018 || 'N/A';
    const ilotCode = feature.properties.code || 'N/A';
    
    layer.bindPopup(`
      <b>Code Commune:</b> ${communeCode}<br>
      <b>Code Îlot:</b> ${ilotCode}
    `);
  };

  return L.geoJSON(statistics, {
    style: style,
    onEachFeature: onEachFeature
  });
}

export function getIcon(position) {
// Créer un icône personnalisé pour le marqueur
const crossIcon = L.divIcon({
  className: 'custom-cross-icon',
  html: '<div style="width: 10px; height: 10px; background-color: black; border: 2px solid white; border-radius: 50%;"></div>',
  iconSize: [10, 10], // Taille de l'icône
  iconAnchor: [5, 5]  // Point d'ancrage de l'icône (centre de l'icône)
});

return L.marker(position, { icon: crossIcon })
}