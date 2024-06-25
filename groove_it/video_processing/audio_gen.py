import os
from moviepy.editor import VideoFileClip,AudioFileClip,CompositeAudioClip
import requests

import io
from pydub import AudioSegment

os.environ['llm']= str({"HUGGINGFACE_API_KEY":"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"})
os.environ['hugging_face_urls'] = str({"MUSIC_GEN_URL":"https://api-inference.huggingface.co/models/facebook/musicgen-small"})
os.environ['VIDEO_CACHE']= "./video_cache"

class AudioGen:
    llm_config = {}
    hugging_face_urls = {}
    
    def __init__(self,video_path,config):
        self.video_path = video_path
        self.llm_config = eval(os.environ['llm'])
        self.hugging_face_urls = eval(os.environ['hugging_face_urls'])
        self.cache_dir = f'{config['env']['CACHE_DIR']}/video_cache'

    def query(self,payload):
        headers = {"Authorization": f"Bearer {self.llm_config['HUGGINGFACE_API_KEY']}"}
        response = requests.post(self.hugging_face_urls['MUSIC_GEN_URL'], headers=headers, json=payload)
        return response.content

    def generate_audio(self,content):
        bytes_audio = self.query({"inputs":content})
        # Convert String to Bytes
        return bytes_audio
    
    def save_audio(self,audio, audio_file_path):
        audio = AudioSegment.from_file(io.BytesIO(audio), format="flac")
        audio.export(audio_file_path, format="wav")
    
    def add_audio(self,content):
        try:
            # Generate Audio
            audio = self.generate_audio(content)
 
            # Save Audio file
            audio_file_path = f"{os.environ['VIDEO_CACHE']}/audio.wav"
            self.save_audio(audio, audio_file_path)
                            
            # Combine Audio with the video file
            clip = VideoFileClip(self.video_path)
            audio_clip = AudioFileClip(audio_file_path)

            composite_audio = CompositeAudioClip([audio_clip])
            clip.audio = composite_audio

            output_file_path = f"{self.cache_dir}/{os.path.basename(self.video_path).split('.')[0]}_updated_audio.mp4"
            clip.write_videofile(output_file_path)

            return {"status": True, "updated_video":output_file_path,"message":"Successfully added audio to video"}
    
        except Exception as e:
            print(e)
            return {"status": False, "message": "Error adding audio to video","error":e}

# Test Code
# audio_gen = AudioGen("./test_videos/test1.mov")
# print(audio_gen.add_audio("Happy Birthday to you"))