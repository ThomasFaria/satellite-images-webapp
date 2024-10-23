from utils.fonctions import creer_donnees_comparaison

file_paths = {
    "2022": "projet-slums-detection/data-prediction/PLEIADES/REUNION/2022/Segmentation/1/statistics_clusters.parquet",
    "2023": "projet-slums-detection/data-prediction/PLEIADES/REUNION/2023/Segmentation/1/statistics_clusters.parquet",
}

data = creer_donnees_comparaison(file_paths)
print(data.to_json())

data