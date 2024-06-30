import os
from dotenv import load_dotenv
load_dotenv()

from moviepy.editor import VideoFileClip
import requests
import cv2


os.environ['VIDEO_CACHE']= "../cache"
os.environ['HUGGINGFACE_API_KEY'] = "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"
os.environ['AVL_URL'] = "https://api-inference.huggingface.co/models/joseluhf11/sign_language_classification"

class AVL_Translate:
    translated_text = ""
    delay = 10
    def __init__(self, video_path,config=None,delay=10):
        self.video_path = video_path
        self.delay = delay

        if(config is None):
            self.cache_dir = os.environ['VIDEO_CACHE']+"/video_cache"
            self.HUGGINGFACE_API_KEY = os.environ['HUGGINGFACE_API_KEY']
            self.API_URL = os.environ['AVL_URL']
            
        else:
            self.cache_dir = config['env']['CACHE_DIR']+"/video_cache"
            self.API_URL = config['env']['AVL_URL']
            self.HUGGINGFACE_API_KEY = config['llm']['HUGGINGFACE_API_KEY']
    
        self.file_name = os.path.basename(self.video_path).split('.')[0]
        self.headers = {"Authorization": f"Bearer {self.HUGGINGFACE_API_KEY}"}

    def gen_avl_description(self):
        temp_filename = 'temp_frame.jpg'
        counter = 5
        try:
            cap = cv2.VideoCapture(self.video_path)
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                if(counter%self.delay==0):
                    cv2.imwrite(temp_filename, frame)         
                    # Read the frame from the file
                    with open(temp_filename, "rb") as f:
                        data = f.read()

                    response = requests.post(self.API_URL, headers=self.headers, data=data)
                    response = response.json()
                    print(response)
                    if(response['status'] == False):
                        continue
                    else:
                        self.translated_text+=response.json()[0]['label']
                
                counter+=1

            cap.release()
            cv2.destroyAllWindows()

        except Exception as e:
            print(e)
            return {"status": False, "message": "Error generating caption", "error": e}

        else:

            return {"status": True, "message": "Successfully generated AVL description","translated_text":self.translated_text}

# Test
# avl_inst = AVL_Translate("./test_videos/test1.mov")
# print(avl_inst.gen_avl_description())
