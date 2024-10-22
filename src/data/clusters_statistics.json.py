import os
from typing import Dict, List

import geopandas as gpd
import s3fs


def merge_gdfs(
    gdfs: Dict[str, gpd.GeoDataFrame], id_columns: List[str], value_columns: List[str]
) -> gpd.GeoDataFrame:
    """Merge multiple GeoDataFrames on specified columns."""
    base_gdf = None
    for year, gdf in gdfs.items():
        year_columns = [*id_columns, *[f"{col}_{year}" for col in value_columns]]
        current_gdf = gdf[year_columns]

        if base_gdf is None:
            base_gdf = current_gdf
        else:
            base_gdf = base_gdf.merge(current_gdf, on=id_columns)

    return base_gdf


file_paths = {
    "2022": "projet-slums-detection/data-prediction/PLEIADES/MAYOTTE/2022/Segmentation/1/statistics_clusters.parquet",
    "2023": "projet-slums-detection/data-prediction/PLEIADES/MAYOTTE/2023/Segmentation/1/statistics_clusters.parquet",
}

id_columns = ["ident_ilot", "code", "depcom_2018", "ident_up", "dep", "geometry"]
value_columns = ["area_cluster", "area_building", "pct_building"]

# Set up S3 filesystem
fs = s3fs.S3FileSystem(
    client_kwargs={"endpoint_url": f"https://{os.environ['AWS_S3_ENDPOINT']}"},
    key=os.getenv("AWS_ACCESS_KEY_ID"),
    secret=os.getenv("AWS_SECRET_ACCESS_KEY"),
    token=os.environ["AWS_SESSION_TOKEN"],
)

gdfs = {year: gpd.read_parquet(path, filesystem=fs) for year, path in file_paths.items()}

# Rename columns in each GeoDataFrame
gdfs = {
    year: gdf.rename(columns={col: f"{col}_{year}" for col in value_columns})
    for year, gdf in gdfs.items()
}

# Merge all GeoDataFrames
merged_gdf = merge_gdfs(gdfs, id_columns, value_columns)


merged_gdf.loc[:, "building_2023"] = merged_gdf.loc[
    :, "area_building_2023"
]*1e6

merged_gdf.loc[:, "area_building_change_absolute"] = (
    merged_gdf.loc[:, "area_building_2023"] - merged_gdf.loc[:, "area_building_2022"]
) * 1e6

merged_gdf.loc[:, "area_building_change_relative"] = (merged_gdf.loc[
    :, "area_building_change_absolute"
] / (merged_gdf.loc[:, "area_building_2022"] * 1e6))*100


# Order columns
ordered_columns = (
    id_columns[:-1]  # All ID columns except geometry
    + [
        "pct_building_2023",
        "building_2023",
        "area_building_change_absolute",
        "area_building_change_relative",
    ]  # Value columns
    + ["geometry"]  # Put geometry at the end
)

print(merged_gdf[ordered_columns].set_index("ident_ilot").to_crs("EPSG:4326").to_json())
