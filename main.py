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
        blur_faces = Blur_Faces(file_path,config=config)
        result = blur_faces.detect_unique_faces()
        result["faces"] = [FileResponse(f"{result['faces_dirs']}/face_{i}.png",media_type="image/png",filename=f'face_{i}.png') for i in result['unique_faces']]

        # Read images from cache and return
        return result

@app.post("/blur_faces")
async def blur_faces(file:UploadFile = File(...),faces:str="all"):
    try:
        file_path = f"{config['env']['CACHE_DIR']}/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        return{"error": f"Error saving file: {e}"}
    else:
        blur_faces = Blur_Faces(file_path,config=config)
        result = blur_faces.blur_faces(faces=faces)
        file_base_name = os.path.basename(file_path).split('.')[0]
        return {"status":"success","blurred_video":FileResponse(result,media_type="video/mp4",filename=f"{file_base_name}_blurred.mp4")}
    
@app.get("/download_blur_video/{video_name}")
async def download_blur_video(video_name:str):
    base_name = os.pathr.basename(video_name).split('.')[0]
    return FileResponse(f"video_cache/{base_name}_blurred.mp4",media_type="video/mp4",filename=f'video_{base_name}_blurred.mp4')

@app.post("/clear_cache")
async def clear_cache():
    try:
        os.system(f"rm -r {config['env']['CACHE_DIR']}/*")
        os.system(f"rm -r {config['env']['CACHE_DIR']}/*")
    except Exception as e:
        return{"error": f"Error clearing cache: {e}"}
    else:
        return {"status": "success"}

@app.get("/download_face/{face_id}")
async def download_face(face_id:int):
    return FileResponse(f"video_cache/faces/face_{face_id}.png",media_type="image/png",filename=f'face_{face_id}.png')