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
  
  // Predictions results
  config.availableYears.forEach((year, index) => {
      const predictionLayer = getWMSTileLayer(
          `${config.name}_PREDICTIONS_${year}`, 
          null, 
          index === 0 ? 'contour_rouge' : 'contour_bleu'
      );
      layers[`Prédictions ${year}`] = predictionLayer;
  });

  return layers;
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