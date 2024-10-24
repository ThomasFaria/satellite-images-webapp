<!-- ```js
const name = view(
  Inputs.text({
    label: "Name",
    placeholder: "Enter your name",
    value: "Anonymous"
  })
);
```

```js
name
```

```js
const search = view(Inputs.search(penguins, {placeholder: "Search penguins…"}));
```

```js
search
```

```js
name
``` -->

## leaflet


```js
const x = view(
  Inputs.text({
    label: "Coordonnées",
    placeholder: "x ?",
    value: "-12.7808"
  })
);
const y = view(
  Inputs.text({
    label: "Coordonnées",
    placeholder: "y ?",
    value: "45.2276"
  })
);
```

```js
var center = [Number(x), Number(y)]; // Utilisation de Number() pour la conversion numérique
```
```js
import * as L from "npm:leaflet";
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

map;

L.control.layers(baseLayers).addTo(map);


``