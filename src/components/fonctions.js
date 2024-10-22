export function calculateQuantiles(values, quantileProbs) {
    values.sort((a, b) => a - b);
    const quantiles = quantileProbs.map(q => {
      const pos = (values.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (values[base + 1] !== undefined) {
        return values[base] + rest * (values[base + 1] - values[base]);
      } else {
        return values[base];
      }
    });
    return quantiles;
  }

export function getColor(value, quantiles, colorScale) {
    for (let i = 0; i < quantiles.length - 1; i++) {
      if (value <= quantiles[i + 1]) {
        return colorScale[i];
      }
    }
    // Si la valeur est supérieure au dernier quantile, retourner la dernière couleur
    return colorScale[colorScale.length - 1];
  }

// Fonction pour créer une fonction de style basée sur des paramètres externes
export function createStyle(quantiles, colorScale) {
    // Retourne une fonction qui prend un feature en paramètre
    return function(feature) {
      return {
        fillColor: getColor(feature.properties.pct_building_2023, quantiles, colorScale),
        weight: 0.7,
        opacity: 1,
        color: 'grey',
        fillOpacity: 0.7
      };
    };
  }
  
// Fonction pour ajouter des popups avec les informations
export function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.pct_building_2023) {
      // Arrondir au dixième
      const roundedPct = feature.properties.pct_building_2023.toFixed(1);
      layer.bindPopup('<b>Pourcentage de bâti 2023:</b> ' + roundedPct + '%');
    }
}

// Fonction pour obtenir une couche WMS depuis GeoServer
export const getWMSTileLayer = (layer, opacity = 1) => {
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