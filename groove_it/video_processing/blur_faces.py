import cv2
import numpy as np

from moviepy.editor import VideoFileClip
import face_recognition

import os

from dotenv import load_dotenv
load_dotenv()

class Blur_Faces:
    # Cascades Dir
    face_cascade_path = "./cascades/haarcascade_frontalface_alt2.xml"
    faces_cache_dir = "faces"
    cache_dir = None
    unique_faces = {}
    unique_faces_dirs = []
    unique_face_encodings = None
    
    def __init__(self,video_path,config=None):
        self.video_path = video_path
        self.config = config

        self.unique_faces = {}
        self.unique_faces_dirs = []
        self.unique_face_encodings = None

        if(config is None):
            self.cache_dir = os.environ['VIDEO_CACHE']+"/video_cache"
        else:
            self.cache_dir = self.config['env']['CACHE_DIR']+"/video_cache"
        
        self.file_name = os.path.basename(self.video_path).split('.')[0]

        # Create Cache Dir
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)

        # Create Faces Cache Dir
        if not os.path.exists(os.path.join(self.cache_dir,self.faces_cache_dir)):
            os.makedirs(os.path.join(self.cache_dir,self.faces_cache_dir))

    def save_images(self,frame,faces):
        for i,face in enumerate(faces):
            (top,right,bottom,left) = face
            roi_color = frame[top:bottom, left:right,:]
            file_name = f'{self.file_name}_face_{i}.png'
            self.unique_faces_dirs.append(file_name)
            cv2.imwrite(f"{self.cache_dir}/{self.faces_cache_dir}/{file_name}", roi_color)

    def unique_face_check(self,frame):
        face_encodings = face_recognition.face_encodings(frame)
        faces = face_recognition.face_locations(frame)

        if(self.unique_face_encodings is None):
            self.unique_face_encodings = face_encodings
            self.save_images(frame,faces)
            return frame
        
        for face,face_encoding in zip(face,face_encodings):
            match = face_recognition.compare_faces(self.unique_face_encodings, face_encoding)
            if not any(match):
                self.save_images(frame,[face])
                self.unique_face_encodings.append(face_encoding)
        
        return frame
    
    def detect_unique_faces(self):
        try:
            clip = VideoFileClip(self.video_path)

            # Run the unique face check on each frame
            clip.fl_image(lambda x: self.unique_face_check(x))

            # Save Unique Face Dict
            self.unique_faces = dict(zip(self.unique_faces_dirs, self.unique_face_encodings))

            return {"status": True, "unique_faces": self.unique_faces_dirs,"faces_dirs": f"{self.cache_dir}"}
        
        except Exception as e:
            print(e)
            return {"status": False, "message": "Error detecting unique faces"}
          

    def populate_unique_faces(self,unique_faces_file_names):
        for img_fname in unique_faces_file_names:
            img_path = f"{self.cache_dir}/{self.faces_cache_dir}/{img_fname}"
            img = cv2.imread(img_path)
            print(type(img))
            face_encoding = face_recognition.face_encodings(img)
            self.unique_faces[img_fname] = face_encoding

    def blur_face(self,frame,faces='all'):
        detected_faces = face_recognition.face_locations(frame)
        new_frame = np.copy(frame)

        if faces == 'all':        
            for (top,right,bottom,left) in detected_faces:     
                roi_color = frame[top:bottom, left:right]
                blur = cv2.GaussianBlur(roi_color, (99, 99), 30)
                new_frame[top:bottom, left:right] = blur

            return  new_frame
        
        else:
            blur_faces = [self.unique_faces[face] for face in faces]
            face_encodings = face_recognition.face_encodings(frame)
            for face, face_encoding in zip(detected_faces,face_encodings):
                # If there is a match blur
                match = face_recognition.compare_faces(blur_faces, face_encoding)
                # print(match)
                if any(match):
                    (top,right,bottom,left) = face
                    roi_color = frame[top:bottom, left:right]
                    blur = cv2.GaussianBlur(roi_color, (99, 99), 30)
                    new_frame[top:bottom, left:right] = blur

            return new_frame
        
    def blur_faces(self,faces='all'):
        clip = VideoFileClip(self.video_path)
        modifiedClip = clip.fl_image(lambda x: self.blur_face(x,faces=faces))
        modifiedClip.write_videofile(f"{self.cache_dir}/{self.file_name}_blurred.mp4")
        return f"{self.cache_dir}/{self.file_name}_blurred.mp4"

# Test    
# Fetch Frames
# blur_face_inst =   Blur_Faces("./test_videos/test2.mp4")
# # frames = blur_face_inst.blur_faces(faces='all')
# print(blur_face_inst.detect_unique_faces())
# #blur_face_inst.clear_cache()
# # blur_face_inst.blur_faces(faces=[0,1])