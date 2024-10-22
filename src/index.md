---
toc: false
---

<div class="hero">
  <h1>CRaTT</h1>
</div>

```js
// npm imports
import {DuckDBClient} from "npm:@observablehq/duckdb";
```

```js
const variable = view(Inputs.select(["pct_building_2023", "area_building_change_absolute", "area_building_change_relative"], {value: "pct_building_2023", label: "Choisissez la variable à afficher"}));
```

```js
Plot.plot({
  width: 975,
  height: 610,
//  projection: "identity",
  x: {axis: null},
  y: {axis: null},
  color: createColorConfig(variable),
  marks: [
    Plot.geo(test2, Plot.centroid({
      fill: d => d.properties.pct_building_2023,
      tip: true,
      channels: {
        Cluster_ID: d => d.id

      }
    })),
  ]
})
```



<!-- QUERIES SQL -->

```js
Inputs.table(test2.features.map(d => d.properties))
```


```js
const test2 = FileAttachment("./data/clusters_statistics.json").json();
```

```js
test2
```


```js
function createColorConfig(value) {
  // const domain = [d3.quantile(test2.features.map(obj => obj.properties[variable]), 0.1), d3.quantile(test2.features.map(obj => obj.properties[variable]), 0.9)]
  const domain = d3.extent(test2.features.map(obj => obj.properties[variable]))

  switch (value) {
    case "pct_building_2023":
      return {
        label: "Pourcentage de bâti (%)",
        type: "linear",
        scheme: "reds",
        legend: true,
        domain: domain,
        range: [0, 1]
      };
    case "area_building_change_absolute":
      return {
        label: "Variation absolue de bâtis (m2)",
        type: "diverging-symlog",
        scheme: "burd",
        domain:domain,
        legend: true,
        pivot: 0,
        symmetric: true
      };
    case "area_building_change_relative":
      return {
        label: "Variation relative de bâtis (%)",
        type: "linear",
        scheme: "reds",
        legend: true,
        domain: domain,
        range: [0, 1]
      };
    default:
      throw new Error("Invalid value provided");
  }
}
```


<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
