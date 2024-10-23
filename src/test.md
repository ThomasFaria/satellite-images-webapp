---
title: Kikou
---

```js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.6.1/dist/d3.min.js";
const data = FileAttachment("./data/clusters_statistics.json").json();
```


```js

Inputs.table(data.features.map(d => d.properties))
//Inputs.table(properties)

```
