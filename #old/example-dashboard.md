---
theme: dashboard
title: Fibonacci
toc: false
---

# Rocket launches 🚀

<!-- Load and transform the data -->

```js
const launches = FileAttachment("data/fibonacci_ratio.json").json();
```

<!-- A shared color scale for consistency, sorted by the number of launches -->

```js
// Transformation des données
const data = Object.keys(launches.Index).map(key => ({
  Index: launches.Index[key],
  Ratio: launches.Ratio[key]
}));
```

```js
data
```

```js
// Création du graphique
Plot.plot({
  marks: [
    Plot.line(data, { x: "Index", y: "Ratio" }),
    Plot.dot(data, { x: "Index", y: "Ratio" }) // Optionnel
  ],
  x: { label: "Index" },
  y: { label: "Ratio" },
  marginLeft: 50,
  marginBottom: 40
})
```
