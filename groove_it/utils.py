import toml
from pathlib import Path

import os

def load_config():
    config_path = Path(os.environ.get("config_toml"))
    try:
        with open(config_path, "r") as f:
            config = toml.load(f)
        return config
    
    except FileNotFoundError:
        raise FileNotFoundError(f"Config file not found at {config_path}")
    
    except Exception as e:
        raise Exception(f"Error loading config: {e}")