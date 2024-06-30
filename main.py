import os
import requests
os.environ["config_toml"] = "config.toml"

from typing import Union
from fastapi import FastAPI
from fastapi import UploadFile, File
from fastapi.responses import FileResponse

from groove_it.utils import load_config, upload_video_cloudinary
from groove_it.groove_it import User
from groove_it.video_processing.blur_faces import Blur_Faces
from groove_it.video_processing.color_blind import ColorBlind
from groove_it.video_processing.avl_translate import AVL_Translate

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
        if(os.getenv("CACHE_DIR") is None):
            file_path = f"{config['CACHE_DIR']}/{file.filename}"
        else:
            file_path = f"{os.getenv('CACHE_DIR')}/{file.filename}"
        
        with open(file_path, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        return{"error": f"Error saving file: {e}"}
    else:
        user_data = User(user_id)
        user_data.generate_ppt(file_path)
        return {"status": "success"}
    
@app.post("/get_faces_cloudinary",responses={200: {"description":"Faces detected"}})
async def get_faces_cloudinary(cloudinary_url:str):
    # Download Video from cloudinary_url
    try:
        response = requests.get(cloudinary_url)
        if(os.getenv("CACHE_DIR") is None):
            file_path = f"{config['env']['CACHE_DIR']}/video.mp4"
        else:
            file_path = f"{os.getenv('CACHE_DIR')}/video.mp4"

        with open(file_path, "wb") as f:
            f.write(response.content)
    except Exception as e:
        return{"error": f"Error saving file: {e}"} 
    else:
        blur_faces = Blur_Faces(file_path,config=config)
        result = blur_faces.detect_unique_faces()
        result["faces"] = [FileResponse(f"{result['faces_dirs']}/face_{i}.png",media_type="image/png",filename=f'face_{i}.png') for i in result['unique_faces']]

        # Read images from cache and return
        return result
    
@app.post("/get_faces",responses={200: {"description":"Faces detected"}})
async def get_faces(file:UploadFile = File(...)):
    try:
        if(os.getenv("CACHE_DIR") is None):
            file_path = f"{config['env']['CACHE_DIR']}/{file.filename}"
        else:
            file_path = f"{os.getenv('CACHE_DIR')}/{file.filename}"
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
        if(os.getenv("CACHE_DIR") is None):
            file_path = f"{config['env']['CACHE_DIR']}/{file.filename}"
        else:
            file_path = f"{os.getenv('CACHE_DIR')}/{file.filename}"

        with open(file_path, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        return{"error": f"Error saving file: {e}"}
    else:
        blur_faces = Blur_Faces(file_path,config=config)
        result = blur_faces.blur_faces(faces=faces)
        file_base_name = os.path.basename(file_path).split('.')[0]
        return {"status":"success","blurred_video":FileResponse(result,media_type="video/mp4",filename=f"{file_base_name}_blurred.mp4")}
    
@app.post("/blur_faces_cloudinary")
async def blur_faces_cloudinary(cloudinary_url:str,file_name:str,faces:str="all"):
    # Download Video from cloudinary_url
    try:
        response = requests.get(cloudinary_url)
        if(os.getenv("CACHE_DIR") is None):
            file_path = f"{config['env']['CACHE_DIR']}/{file_name}"
        else:
            file_path = f"{os.getenv('CACHE_DIR')}/{file_name}"

        with open(file_path, "wb") as f:
            f.write(response.content)
    except Exception as e:
        return{"error": f"Error saving file: {e}"} 
    else:
        blur_faces = Blur_Faces(file_path,config=config)
        result = blur_faces.blur_faces(faces=faces)

        # Upload Video in Cloudinary and Return Cloudinary Response
        response_dict = await upload_video_cloudinary(result,config)

        file_base_name = os.path.basename(file_path).split('.')[0]
        return {"status":"success","blurred_video":FileResponse(result,media_type="video/mp4",filename=f"{file_base_name}_blurred.mp4"),"response_dict":response_dict}
    
@app.get("/download_blur_video/{video_name}")
async def download_blur_video(video_name:str):
    base_name = os.path.basename(video_name).split('.')[0]
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


@app.post("/daltonize_video_cloudinary",responses={200: {"description":"Daltonized Video"}})
async def daltonize_video_cloudinary(cloudinary_url:str,video_name:str,daltonize_type:str="d"):
    # Download Video from cloudinary_url
    try:
        response = requests.get(cloudinary_url)
        if(os.getenv("CACHE_DIR") is None):
            file_path = f"{config['env']['CACHE_DIR']}/{video_name}.mp4"
        else:
            file_path = f"{os.getenv('CACHE_DIR')}/{video_name}.mp4"

        with open(file_path, "wb") as f:
            f.write(response.content)
    except Exception as e:
        return{"error": f"Error saving file: {e}"} 
    else:
        color_blind = ColorBlind(file_path,config=config)
        result = color_blind.daltonize_video(daltonize_type=daltonize_type)

        # Upload Video in Cloudinary and Return Cloudinary Response
        response_dict = await upload_video_cloudinary(result['daltonized_video'],config)

        file_base_name = os.path.basename(file_path).split('.')[0]
        return {"status":"success","daltonized_video":FileResponse(result['daltonized_video'],media_type="video/mp4",filename=f"{file_base_name}_daltonized.mp4"),"response_dict":response_dict}

@app.post("/avl_support",responses={200: {"description":"AVL Support"}})
async def avl_support(video_path:str,delay:int=10):
    avl_inst = AVL_Translate(video_path,config=config,delay=delay)
    result = avl_inst.gen_avl_description()
    return result

@app.post("/avl_support_cloudinary",responses={200: {"description":"AVL Support"}})
async def avl_support_cloudinary(cloudinary_url:str,video_name:str,delay:int=10):
    # Download Video from cloudinary_url
    try:
        response = requests.get(cloudinary_url)   
        if os.getenv("CACHE_DIR") is None:
            file_path = f"{config['env']['CACHE_DIR']}video_cache/{video_name}.mp4"

        with open(file_path, "wb") as f:
            f.write(response.content)
    except Exception as e:
        return{"error": f"Error saving file: {e}"} 
    else:
        avl_inst = AVL_Translate(file_path,config=config,delay=delay)
        result = avl_inst.gen_avl_description()
        return result
