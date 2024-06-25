import os

import cv2
import PIL

import google.generativeai as genai

class ImageCaption:
    counter_cnx = 0
    standard_delay = 30
    response  = "This is a test caption"

    safety_settings = [
    {
        "category": "HARM_CATEGORY_DANGEROUS",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_NONE",
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_NONE",
    },
]

    def __init__(self, video_path,config=None):
        self.video_path = video_path
        genai.configure(api_key=config['env']['GEMINI_API_KEY'])
    
        self.model = genai.GenerativeModel('gemini-1.5-flash', safety_settings=self.safety_settings)
        self.cache_dir = config['env']['CACHE_DIR']+"/video_cache"

        self.file_name = os.path.basename(self.video_path).split('.')[0]

    def attach_caption(self,frame,delay):
        # Setting the font and size for the caption
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 1
        font_color = (255, 255, 255)
        line_type = 2

        if(delay == 0):
            delay = self.standard_delay
            cv2.imwrite(f"{self.cache_dir}/{self.file_name}_captioned_{self.counter_cnx}.png",frame)
            img = PIL.Image.open(f"{self.cache_dir}/{self.file_name}_captioned_{self.counter_cnx}.png")
            response = self.model.generate_content(["Write a short description of the image.",img])
            if(response!=None):
                self.response = response.text

        cv2.putText(frame, self.response, (10, 30), font, font_scale, font_color, line_type)
        return frame,delay-1
        
    def generate_caption(self):
        try:
            cap = cv2.VideoCapture(self.video_path)
            out = cv2.VideoWriter(f"{self.cache_dir}/{self.file_name}_captioned.mp4",cv2.VideoWriter_fourcc(*'mp4v'), 30, (int(cap.get(3)),int(cap.get(4))))
            delay = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                frame,delay = self.attach_caption(frame,delay)
                # Writing the frame
                out.write(frame)
                self.counter_cnx+=1

            cap.release()
            cv2.destroyAllWindows()
            out.release()
            self.counter_cnx = 0

        except Exception as e:
            print(e)
            return {"status": False, "message": "Error generating caption", "error": e}

# Test Code
# image_caption = ImageCaption("./test_videos/test1.mov")
# image_caption.generate_caption()