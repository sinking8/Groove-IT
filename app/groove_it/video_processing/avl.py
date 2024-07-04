import os
from dotenv import load_dotenv
load_dotenv()

import requests
import cv2

from groove_it.video_processing.llm.avl_support import ChatTogetherAVL

class AVL_Translate:
    translated_text = []
    def __init__(self, video_path,config=None,delay=15,model='mistralai/Mixtral-8x7B-Instruct-v0.1'):
        self.video_path = video_path
        self.delay = delay
        self.model = model

        if(config is None):
            self.cache_dir = os.environ['VIDEO_CACHE']+"/video_cache"
            self.HUGGINGFACE_API_KEY = os.environ['HUGGINGFACE_API_KEY']
            self.API_URL = os.environ['AVL_URL']
            self.TOGETHER_API_KEY = os.environ['TOGETHER_API_KEY']
            
        else:
            self.cache_dir = config['env']['CACHE_DIR']+"/video_cache"
            self.API_URL = config['env']['AVL_URL']
            self.HUGGINGFACE_API_KEY = config['llm']['HUGGINGFACE_API_KEY']
            self.TOGETHER_API_KEY = config['llm']['TOGETHER_API_KEY']
    
        # AVL SUPPORT INSTANCE  
        self.avl_support = ChatTogetherAVL(config=None,model=self.model)

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
                    if('status' in response and response['status']=='error'):
                        continue
                    else:
                        self.translated_text.append(response[0]['label'])
                
                counter+=1

            cap.release()
            cv2.destroyAllWindows()

        except Exception as e:
            print(e)
            return {"status": False, "message": "Error generating caption", "error": e}

        else:
            response = self.avl_support.get_avl_response(self.translated_text,self.delay)
            return {"status": True, "message": "Successfully generated AVL description","translated_text":response}
