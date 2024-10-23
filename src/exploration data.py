import json

# Define the path to the JSON file
file_path = '.observablehq/cache/data/clusters_statistics.json'

# Attempt to read and load the JSON file

with open(file_path, 'r') as file:
    statistics_data = json.load(file)

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

