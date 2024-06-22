import os
os.environ["config_toml"] = "config.toml"

from typing import Union
from fastapi import FastAPI
from fastapi import UploadFile, File
from fastapi.responses import FileResponse

from groove_it.utils import load_config
from groove_it.groove_it import User
from groove_it.video_processing.blur_faces import Blur_Faces

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

@app.post("/get_faces",responses={200: {"description":"Faces detected"}})
async def get_faces(file:UploadFile = File(...)):
    try:
        file_path = f"{config['env']['CACHE_DIR']}/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        return{"error": f"Error saving file: {e}"}
    else:
        blur_faces = Blur_Faces(file_path)
        result = blur_faces.detect_unique_faces()
        result["faces"] = [FileResponse(f"{result['faces_dirs']}/face_{i}.png",media_type="image/png",filename=f'face_{i}.png') for i in result['unique_faces']]

        # Read images from cache and return
        return result

@app.get("/download_face/{face_id}")
async def download_face(face_id:int):
    return FileResponse(f"video_cache/faces/face_{face_id}.png",media_type="image/png",filename=f'face_{face_id}.png')