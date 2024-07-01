import toml
from pathlib import Path

import os

import cloudinary
import cloudinary.uploader

import string
import random

def generate_random_string(length=10):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def set_environment_variables(config):
    # Setting up the environment variables
    for key,value in config['db'].items():
        os.environ[key] = value

    # Setting HuggingFace URLS
    for key,value in config['hugging_face_urls'].items():
        os.environ[key] = value

    os.environ['PROMPTS_JSON'] = config['env']['PROMPTS_JSON']
    os.environ['CACHE_DIR'] = config['env']['CACHE_DIR']

def load_config():
    config_path = Path(os.environ.get("config_toml"))
    try:
        with open(config_path, "r") as f:
            config = toml.load(f)
        
        set_environment_variables(config)
        return config
    
    except FileNotFoundError:
        raise FileNotFoundError(f"Config file not found at {config_path}")
    
    except Exception as e:
        raise Exception(f"Error loading config: {e}")
    
async def upload_video_cloudinary(video_path,config):
    cloudinary.config(
        cloud_name = os.environ.get("CLOUDINARY_APP_NAME"),
        api_key = os.environ.get("CLOUDINARY_API_KEY"),
        api_secret = os.environ.get("CLOUDINARY_API_SECRET")
    )
    response = cloudinary.uploader.upload_large(video_path, resource_type="video")
    response_dict = {'public_id':response[u'public_id'],'url':response[u'url'],"cloud_name":os.environ.get("CLOUDINARY_APP_NAME")}
    return response_dict
