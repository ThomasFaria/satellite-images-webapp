import { quantileProbs, colorScales, } from '../components/config.js';
import { calculateQuantiles, } from '../components/functions.js';

// Function to update the legend based on the currently active layer
export function updateLegendForLayer(legend, layerName, statistics, labels) {
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