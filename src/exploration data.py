import json

# Define the path to the JSON file
file_path = '.observablehq/cache/data/clusters_statistics.json'

# Attempt to read and load the JSON file
try:
    with open(file_path, 'r') as file:
        statistics_data = json.load(file)
    
    # Extract the structure summary: keys at top-level and an example entry
    structure_summary = {
        "top_level_keys": list(statistics_data.keys()) if isinstance(statistics_data, dict) else "Not a dictionary",
        "example_entry": statistics_data[next(iter(statistics_data))] if isinstance(statistics_data, dict) else "Not a dictionary"
    }
    
    # Display the structure summary to understand the file
    structure_summary

except FileNotFoundError:
    structure_summary = "File not found. Please check the path."
except json.JSONDecodeError:
    structure_summary = "Error decoding JSON. Please check the file format."


structure_summary
statistics_data["features"][0]

import geopandas as gpd
from shapely.geometry import shape

# Extract features from statistics_data
features = statistics_data["features"]

# Convert features into GeoDataFrame format
geometry = [shape(feature["geometry"]) for feature in features]
properties = [feature["properties"] for feature in features]

# Create a GeoDataFrame
gdf = gpd.GeoDataFrame(properties, geometry=geometry)

# Display the GeoDataFrame structure to the user
gdf

