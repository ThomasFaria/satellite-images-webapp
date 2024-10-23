// Fonction pour calculer les quantiles
export function calculateQuantiles(values, quantileProbs) {
  values.sort((a, b) => a - b);
  return quantileProbs.map(q => {
    const pos = (values.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return values[base + 1] !== undefined ? values[base] + rest * (values[base + 1] - values[base]) : values[base];
  });
}

// Fonction pour obtenir la couleur en fonction de la valeur et des quantiles
export function getColor(value, quantiles, colorScale) {
  for (let i = 0; i < quantiles.length - 1; i++) {
    if (value <= quantiles[i + 1]) {
      return colorScale[i];
    }
  }
  return colorScale[colorScale.length - 1];
}

// Fonction pour créer une fonction de style basée sur un indicateur spécifique
export function generateStyleFunction(indicator, quantiles, colorScale) {
  // Retourne une fonction qui prend 'feature' en paramètre
  return function (feature) {
    const value = feature.properties[indicator]; // Récupère la valeur dynamique basée sur l'indicateur
    return {
      fillColor: getColor(value, quantiles, colorScale),
      weight: 0.7,
      opacity: 1,
      color: 'black',
      fillOpacity: 0.7
    };
  };
}
export function getWMSTileLayer(layer, styleName = null, opacity = 1) {
  const url = 'https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms';
  const geoserverWorkspace = 'dirag';

  // Initialize the wmsOptions object with the style parameter
  const wmsOptions = {
    layers: `${geoserverWorkspace}:${layer}`,
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    opacity: opacity,
    attribution: 'GeoServer'
  };
  
  if(styleName) {
    wmsOptions.styles = styleName
  }
  // Return the tile layer with the WMS options
  return L.tileLayer.wms(url, wmsOptions);
}


// Fonction générale pour créer une couche GeoJSON avec un indicateur spécifique
export function createGeoJsonLayer(statistics, indicator, label, quantileProbs, colorScale) {
  const values = statistics.features.map(f => f.properties[indicator]);
  const quantiles = calculateQuantiles(values, quantileProbs);
  const style = generateStyleFunction(indicator, quantiles, colorScale);

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties[indicator] !== undefined && feature.properties[indicator] !== null) {
      // Vérifie si la valeur est un nombre avant d'utiliser toFixed
      const roundedValue = !isNaN(feature.properties[indicator]) 
        ? feature.properties[indicator].toFixed(1) 
        : 'NA';
      layer.bindPopup(`<b>${label}:</b> ${roundedValue}%`);
    } else {
      layer.bindPopup(`<b>${label}:</b> NA`);
    }
  };

  return L.geoJson(statistics, {
    style: style,
    onEachFeature: onEachFeature
  });
}

// Fonction pour mettre à jour la légende
export function updateLegend(indicator, colorScale, quantiles) {
  const div = L.DomUtil.create('div', 'info legend');
  const labels = [];

  div.innerHTML += `<h4 style="color:black; text-shadow: -1px 0px 1px white, 0px -1px 1px white, 1px 0px 1px white, 0px 1px 1px white;">${indicator.label} (%)</h4>`;

  for (let i = 0; i < quantiles.length - 1; i++) {
    const from = quantiles[i];
    const to = quantiles[i + 1];
    const color = colorScale[i];

    labels.push(
      `<i style="background:${color}; width:18px; height:18px; float:left; margin-right:8px; opacity:1;"></i>` +
      `<span style="color:black; text-shadow: -1px 0px 1px white, 0px -1px 1px white, 1px 0px 1px white, 0px 1px 1px white;">${Math.round(from)} &ndash; ${Math.round(to)}</span>`
    );
  }

  div.innerHTML += labels.join('<br>');

  div.style.opacity = '1';
  div.style.backgroundColor = 'white';
  div.style.padding = '8px';
  div.style.borderRadius = '5px';
  div.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)';

  return div;
}
