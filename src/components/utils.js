// loaders.js


// Filters an object to include only the specified keys.
export function filterObject(obj, keysToKeep) {
    return keysToKeep.reduce((acc, key) => {
      if (obj.hasOwnProperty(key)) {
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  }
