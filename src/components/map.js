// departmentUtils.js
import * as L from "npm:leaflet";

import {departmentConfig} from "./config.js";

export class DepartmentMapVisualizer {
  constructor(div, department) {
    if (!departmentConfig[department]) {
      throw new Error(`Department ${department} not configured`);
    }
    this.department = department;
    this.div = div;
    this.config = departmentConfig[department];
    this.statistics = null;
    this.map = null;
    this.layers = {
      base: {},
      overlays: {}
    };
  }

  async initializeData() {
    try {
      if (this.config.dataFile) {
        const fileAttachment = this.config.dataFile();
        this.statistics = await fileAttachment.json();
      }
    } catch (dataLoadError) {
      console.warn(`No data file found for ${this.department}:`, dataLoadError);
    }
  
  }

  createMap() {
    this.map = L.map(this.div).setView(this.config.center, 10);

    // Add base layers
    this.addBaseLayers();
  }

  addBaseLayers() {
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });
    
    const darkBaseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    });

    this.layers.base = {
      'OpenStreetMap Light': baseLayer,
      'OpenStreetMap Dark': darkBaseLayer
    };

    baseLayer.addTo(this.map);
  }

  addYearLayers() {
    this.config.availableYears.forEach((year, index) => {
      const pleiadesLayer = this.getWMSTileLayer(`${this.config.name}_${year}`, year);
      this.layers.base[`Pleiades ${year}`] = pleiadesLayer;
      
      const predictionLayer = this.getWMSTileLayer(
        `${this.config.name}_PREDICTIONS_${year}`, 
        null, 
        index === 0 ? 'contour_rouge' : 'contour_bleu'
      );
      this.layers.overlays[`Prediction ${year}`] = predictionLayer;
    });
  }

  addStatisticsLayers() {
    const INDICATORS = [
      { 
        key: 'pct_building_2023', 
        label: 'Building Percentage 2023', 
        colorScale: 'redScale', 
        unit: '%' 
      },
      { 
        key: 'building_2023', 
        label: 'Building Surface', 
        colorScale: 'greenScale', 
        unit: 'm²' 
      },
      // Add more indicators as needed
    ];

    INDICATORS.forEach(indicator => {
      const layer = this.createGeoJsonLayer(
        indicator.key, 
        indicator.label, 
        indicator.colorScale, 
        indicator.unit
      );
      this.layers.overlays[indicator.label] = layer;
    });
  }

  addLayerControls() {
    L.control.layers(
      this.layers.base, 
      this.layers.overlays
    ).addTo(this.map);
  }

  setupLegend() {
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = () => {
      return L.DomUtil.create('div', 'info legend');
    };

    this.map.on('overlayadd', (event) => {
      legend.addTo(this.map);
      this.updateLegend(event.name);
    });

    this.map.on('overlayremove', () => {
      this.map.removeControl(legend);
    });
  }

  updateLegend(layerName) {
    // Implement legend update logic
  }

  // Placeholder methods - implement these with your specific utility functions
  getWMSTileLayer() { /* WMS tile layer logic */ }
  createGeoJsonLayer() { /* GeoJSON layer creation */ }
}