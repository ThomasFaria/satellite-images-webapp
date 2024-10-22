
<!-- QUERIES SQL -->

```js
centroid
```

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
        type: "diverging",
        scheme: "burd",
        domain: domain,
        legend: true,
        pivot: 0,
        symmetric: true
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
