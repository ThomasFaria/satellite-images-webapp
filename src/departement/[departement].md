```js
import {loadDepartmentGeom, loadDepartmentLevel, loadDepartmentEvol} from "../components/loaders.js";
import {getConfig} from "../components/config.js";
import {transformData} from "../components/build-table.js";
import {getIlotCentroid} from "../utils/fonctions.js";
import {getOSM, getOSMDark, getMarker, getSatelliteImages, getPredictions, getClusters, getEvolutions} from "../components/map-layers.js";
import {filterObject} from "../components/utils.js";

```
```js
// Get the department from the URL parameter
const department = new URL(window.location.href).pathname.split('/').pop();
console.log(`The current department is ${department}`);
```

```js
// Fonction pour formater le nom du département (première lettre en majuscule)
function formatdepartmentName(nom) {
  return nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase();
}
// Crée un élément h1 avec le nom du département
const titre = html`<h1>Informations géographiques : ${formatdepartmentName(department)}</h1>`;
display(titre);
```


```js
const configg = getConfig(department);
const geom = await loadDepartmentGeom(department);
const level = await loadDepartmentLevel(department);
const evol = await loadDepartmentEvol(department);
```

```js
```

```js
const available_years = configg["availableYears"]
const years_select = view(Inputs.form({
  year_start : Inputs.select(available_years, {value: available_years[0], label: "annee debut"}),
  year_end : Inputs.select(available_years, {value: available_years[1], label: "annee fin"})
},
 {
    template: (formParts) => htl.html`
     <div>
       <div style="
         width: 400px;
         display: flex;
         gap: 10px;
       ">
         ${Object.values(formParts)}
       </div>
     </div>`
  }
))
```

```js
const year_start = years_select["year_start"]
const year_end = years_select["year_end"]
const data_select = transformData(evol, level, year_start, year_end);
```

```js
 //récupération du centre de l'ilot à partir de l'ilot sélectionné
    const placeholder_commune = data_select[0].depcom_2018
    const placeholder_ilot = data_select[0].code
    const placeholder_param = placeholder_commune + " " + placeholder_ilot
 ```

 ```js
 const search = view(
      Inputs.search(data_select, 
      {
        placeholder: placeholder_param,
        columns:["depcom_2018","code"]
      })
    )
```

```js
    const search_table = view(
      Inputs.table(search, {
        columns: ['depcom_2018', 'code', `aire_${year_end}`, `pourcentage_bati_${year_end}`, 'evol_abs', 'evol_rela'],
        header: {
          depcom_2018: 'Code Commune',
          code: 'Code Îlot',
          [`aire_${year_end}`]: `Surface ${year_end} (m²)`,
          [`pourcentage_bati_${year_end}`]: `Bâti ${year_end} (%)`,
          evol_abs: 'Écart absolu (m²)',
          evol_rela: 'Écart relatif (%)'
        },
        width: {
          depcom_2018: 120,
          code: 100,
          [`aire_${year_end}`]: 120,
          [`pourcentage_bati_${year_end}`]: 90,
          evol_abs: 120,
          evol_rela: 120
        },
        format: {
          [`aire_${year_end}`]: x => Math.round(x),
          [`pourcentage_bati_${year_end}`]: x => Math.round(x),
          evol_abs: x => Math.round(x),
          evol_rela: x => (Math.round(x * 10) / 10)
        },
        sort: {
          column: 'depcom_2018',
          reverse: false
        },
        rows: 10
      })
    )
```


## Analyse des îlots

```js
const center = getIlotCentroid(
    geom,
    search[0]?.depcom_2018 || placeholder_commune,
    search[0]?.code || placeholder_ilot
  )
console.log(center)
```
```js
// Initialisation de la carte Leaflet
const mapDiv = display(document.createElement("div"));
mapDiv.style = "height: 600px; width: 100%; margin: 0 auto;";

// Initialiser la carte avec la position centrale du département
const map2 = L.map(mapDiv, {
            center: center,
            zoom: 17,           
            maxZoom: 21 //(or even higher)
        });

// Ajout d'une couche de base OpenStreetMap
const OSM = getOSM();
const OSMDark  = getOSMDark();
const marker = getMarker(center);
const PLEIADES =  getSatelliteImages(configg);
const BORDERS = getClusters(geom);

const PREDICTIONS = getPredictions(configg)
const selectedPredictions = filterObject(PREDICTIONS, [`Prédictions ${year_start}`, `Prédictions ${year_end}`,])

map2.addLayer(selectedPredictions[`Prédictions ${year_end}`]);

// Ajout des couches par défaut
OSM['OpenStreetMap clair'].addTo(map2);
BORDERS['Contours des îlots'].addTo(map2);

// Ajouter le marqueur à la carte
marker.addTo(map2);

L.control.layers({
  ...OSM,
  ...OSMDark,
  ...PLEIADES
  },
  {
    ...selectedPredictions,
  }
  ).addTo(map2);

```

## Analyse des évolutions

<!-- ```js
// Récupération des différentes couches de la carte
const OSM = getOSM();
const marker = getMarker(center);
const BORDERS = getClusters(geom);

///// Initialisation de la carte Leaflet
const mapDiv = display(document.createElement("div"));
mapDiv.style = "height: 600px; width: 100%; margin: 0 auto;";
const map3 = L.map(mapDiv, {
            center: center,
            zoom: 17,           
            maxZoom: 21 
        });

// Ajout des couches par défaut
OSM['OpenStreetMap clair'].addTo(map3);
BORDERS['Contours des îlots'].addTo(map3);

// Ajouter le marqueur à la carte
marker.addTo(map3);


L.control.layers({
  ...OSM,
  // ...OSMDark,
  // ...PLEIADES,
  },{
  // ...EVOLUTIONS_ABS,
  ...BORDERS,
}).addTo(map3); -->

<!-- ``` -->










