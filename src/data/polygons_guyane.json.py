import os
import duckdb
import geopandas as gpd
from shapely import wkt
from utils.fonctions import reproject_geometry


# Connexion à DuckDB
con = duckdb.connect(database=":memory:")

# Configurer la connexion S3
con.execute(
    f"""
    SET s3_endpoint='{os.getenv("AWS_S3_ENDPOINT")}';
    SET s3_access_key_id='{os.getenv("AWS_ACCESS_KEY_ID")}';
    SET s3_secret_access_key='{os.getenv("AWS_SECRET_ACCESS_KEY")}';
    SET s3_session_token='';
    INSTALL SPATIAL;
    LOAD SPATIAL;
    """
)

URL_GUYANE_2024 = "projet-slums-detection/data-raw/PLEIADES/GUYANE_brut/polygones_images_brutes_2024_no_preproc.parquet"
# Charger les données depuis le Parquet
df = con.execute(f"SELECT * FROM read_parquet('s3://{URL_GUYANE_2024}')").fetchdf()
con.close()

# Convertir WKT en objets géométriques
df["geometry"] = df["Polygon"].apply(wkt.loads)

# Convertir en GeoDataFrame
gdf = gpd.GeoDataFrame(df, geometry="geometry")

# Appliquer la reprojection
gdf["geometry"] = gdf.apply(lambda row: reproject_geometry(row.geometry, row.CRS, 2972), axis=1)
gdf["geometry"] = gdf.apply(lambda row: reproject_geometry(row.geometry, 2972, 4326), axis=1)

# Supprimer les éventuelles géométries non converties
gdf = gdf.dropna(subset=["geometry"]).drop(columns=["Polygon", "CRS"])

print(gdf.to_json())
