import sys

from utils.wrappers import dataframe_to_parquet_bytes, get_data_level

available_years = ["2024"]
dep = "SAINT-MARTIN"
model_name = "Segmentation-multiclass"
model_version = "1"

data = get_data_level(available_years, dep, model_name, model_version)

buf_bytes = dataframe_to_parquet_bytes(data)

# Write the bytes to standard output
sys.stdout.buffer.write(buf_bytes)
