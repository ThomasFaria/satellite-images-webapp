import os

import duckdb

URL_MAYOTTE_2023 = "projet-slums-detection/data-prediction/PLEIADES/MAYOTTE/2023/Segmentation/1/statistics_clusters.parquet"
URL_MAYOTTE_2022 = "projet-slums-detection/data-prediction/PLEIADES/MAYOTTE/2022/Segmentation/1/statistics_clusters.parquet"

con = duckdb.connect(database=":memory:")

# Setting up S3 connection
con.execute(
    f"""
SET s3_endpoint='{os.getenv("AWS_S3_ENDPOINT")}';
SET s3_access_key_id='{os.getenv("AWS_ACCESS_KEY_ID")}';
SET s3_secret_access_key='{os.getenv("AWS_SECRET_ACCESS_KEY")}';
SET s3_session_token='';
INSTALL SPATIAL;
LOAD SPATIAL;


COPY(
    SELECT
        m23.*,
        m22.area_cluster as area_cluster_2022,
        m22.area_building as area_building_2022,
        m22.pct_building as pct_building_2022
    FROM read_parquet('s3://{URL_MAYOTTE_2023}') m23
    INNER JOIN read_parquet('s3://{URL_MAYOTTE_2022}') m22
        ON m23.ident_ilot = m22.ident_ilot
        AND m23.code = m22.code
        AND m23.depcom_2018 = m22.depcom_2018
        AND m23.ident_up = m22.ident_up
        AND m23.dep = m22.dep
        AND m23.geometry = m22.geometry
) TO STDOUT (FORMAT 'parquet', COMPRESSION 'gzip');
"""
)

con.close()
