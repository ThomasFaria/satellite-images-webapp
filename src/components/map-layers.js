// loaders.js
export function getOSM() {
    const OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 21,
      });
    return {'OpenStreetMap clair': OSM}
}

export function getOSMDark() {
    const OSMDark  = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
        subdomains: 'abcd',
          maxZoom: 21,
      });
    return {'OpenStreetMap sombre': OSMDark}
}

export function getMarker(center) {
    // Créer un icône personnalisé pour le marqueur
    const crossIcon = L.divIcon({
        className: 'custom-cross-icon',
        html: '<div style="width: 10px; height: 10px; background-color: black; border: 2px solid white; border-radius: 50%;"></div>',
        iconSize: [10, 10], // Taille de l'icône
        iconAnchor: [5, 5]  // Point d'ancrage de l'icône (centre de l'icône)
    });
    const marker  = L.marker(center, { icon: crossIcon })
    return marker
}

export function getSatelliteImages(config) {
    const { availableYears, name } = config;
    const satelliteImages = {};

    // Get tile for each year
    availableYears.forEach(year => {
        const layer = L.tileLayer.wms("https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms", {
            layers: `dirag:${name}_${year}`,
            format: 'image/png',
            transparent: true,
            version: '1.1.0',
            opacity: 1,
            maxZoom: 21,
            attribution: `Pleiades &copy; CNES ${year}, Distribution AIRBUS DS`
        });
        satelliteImages[`Pleiades ${year}`] = layer;
    });

    return satelliteImages;
}

