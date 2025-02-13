from utils.wrappers import get_cluster_geom

dep = "MARTINIQUE"

clusters = get_cluster_geom(dep)

print(clusters.to_json())
