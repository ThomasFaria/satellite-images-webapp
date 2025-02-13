from utils.wrappers import get_cluster_geom

dep = "REUNION"

clusters = get_cluster_geom(dep)

print(clusters.to_json())
