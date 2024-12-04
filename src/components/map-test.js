// departmentUtils.js
import * as L from "npm:leaflet";

import {departmentConfig} from "./config.js";


export function createMap(div, department) {
  const config = departmentConfig[department];
  if (!config) {
    console.error(`Department ${department} does not exist in the configuration.`);
    return null;
  }

  // Create map with department's center
  const map = L.map(div).setView(config.center, 14);

  // Add base tile layers
  const baseLayers = {
    'OpenStreetMap': L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }),
    'Dark Map': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB contributors'
    })
  };

  // Add default layer
  baseLayers['OpenStreetMap'].addTo(map);

  return { map, baseLayers };
}

export function addYearLayers(department, baseLayers) {
  const config = departmentConfig[department];
  
  config.availableYears.forEach((year, index) => {
    const pleiadesLayer = getWMSTileLayer(`${config.name}_${year}`, year);
    baseLayers[`Pleiades ${year}`] = pleiadesLayer;
    
    const predictionLayer = getWMSTileLayer(
      `${config.name}_PREDICTIONS_${year}`, 
      null, 
      index === 0 ? 'contour_rouge' : 'contour_bleu'
    );
    baseLayers[`Prediction ${year}`] = predictionLayer;
  });
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
    wmsOptions.attribution = `Pleiades &copy; CNES_${year}, Distribution AIRBUS DS`;
  }
  // Return the tile layer with the WMS options
  return L.tileLayer.wms(url, wmsOptions);
}