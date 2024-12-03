
```js
// Usage example
async function initializeDepartmentMap() {
  const department = new URL(window.location.href).pathname.split('/').pop();
  
  try {
    const visualizer = new DepartmentMapVisualizer(department);
    await visualizer.initializeData();
    visualizer.createMap('map-container');
  } catch (error) {
    console.error('Failed to initialize map:', error);
  }
}
```

```js
initializeDepartmentMap();
```