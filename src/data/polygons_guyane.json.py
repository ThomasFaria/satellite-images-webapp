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
    SET s3_session_token='eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NLZXkiOiJEREE4ODVHRlVYNTBFR04xM0lROCIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sImF1ZCI6WyJtaW5pby1kYXRhbm9kZSIsIm9ueXhpYSIsImFjY291bnQiXSwiYXV0aF90aW1lIjoxNzM4ODM4OTYwLCJhenAiOiJvbnl4aWEiLCJlbWFpbCI6InJheWEuYmVyb3ZhQGluc2VlLmZyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV4cCI6MTczOTc4MzYzOSwiZmFtaWx5X25hbWUiOiJCRVJPVkEiLCJnaXZlbl9uYW1lIjoiUmF5YSIsImdyb3VwcyI6WyJVU0VSX09OWVhJQSIsImdhaWEiLCJoYWNrYXRob24tbnR0cy0yMDI1Iiwic2x1bXMtZGV0ZWN0aW9uIl0sImlhdCI6MTczOTE3ODgzOSwiaXNzIjoiaHR0cHM6Ly9hdXRoLmxhYi5zc3BjbG91ZC5mci9hdXRoL3JlYWxtcy9zc3BjbG91ZCIsImp0aSI6IjRkMDJlMTgxLTQwYTUtNDkwNS1iYWM0LWRlY2U1MDEwMTg0MyIsIm5hbWUiOiJSYXlhIEJFUk9WQSIsInBvbGljeSI6InN0c29ubHkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJyYXlhYmVyb3ZhIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLXNzcGNsb3VkIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtc3NwY2xvdWQiXSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBncm91cHMgZW1haWwiLCJzaWQiOiIyMjkwYjMwMi0zOTI1LTQ2YmYtYjkyZS1iNWZiODgwZjhiMjMiLCJzdWIiOiJlNGJmNmFhMi0zNWRkLTQ1ODAtODQ1Mi1iOWRkYzlkMmNmMDUiLCJ0eXAiOiJCZWFyZXIifQ.dgFvKP_UeuJqLEWMEG5cnYR4sKbxh01pTF8p-FjG0Q3TmGgTMBrseCAgjyGj-8yRvWvnOZkrBhGtdVtdnCkCqw';
    INSTALL SPATIAL;
    LOAD SPATIAL;
    """
)

URL_GUYANE_2024 = "projet-slums-detection/data-raw/PLEIADES/GUYANE_brut/polygones_images_brutes_2024.parquet"
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
