import os
os.environ["config_toml"] = "config.toml"

from typing import Union
from fastapi import FastAPI
from fastapi import UploadFile, File

from teach_it.utils import load_config
from teach_it.teach_it import User

app  = FastAPI()
config = load_config()

@app.get("/")
def home():
    return {"Hello": "World"}

@app.post("/generate_ppt/{user_id}")
def generate_ppt(user_id:str,file:UploadFile = Union[File(...),None]):
    if(file == None):
        return {"error": "No file uploaded"}
    try:
        file_path = f"{config['CACHE_DIR']}/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        return{"error": f"Error saving file: {e}"}
    else:
        user_data = User(user_id)
        user_data.generate_ppt(file_path)
        return {"status": "success"}