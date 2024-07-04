import os
from moviepy.editor import VideoFileClip,AudioFileClip,CompositeAudioClip
import requests

import io
from pydub import AudioSegment

class AudioGen:
    def __init__(self,video_path,config):
        self.video_path = video_path
        if(config is None):
            self.HUGGINGFACE_API_KEY = os.environ['HUGGINGFACE_API_KEY']
            self.MUSIC_GEN_URL = os.environ['MUSIC_GEN_URL']
            self.cache_dir = f'{os.environ["CACHE_DIR"]}/video_cache'

        else:
            self.HUGGINGFACE_API_KEY = config['llm']['HUGGINGFACE_API_KEY']
            self.MUSIC_GEN_URL = config['hugging_face_urls']['MUSIC_GEN_URL']
            self.cache_dir = f'{config['env']['CACHE_DIR']}/video_cache'

        self.file_name = os.path.basename(self.video_path).split('.')[0]

    def query(self,payload):
        headers = {"Authorization": f"Bearer {self.HUGGINGFACE_API_KEY}"}
        response = requests.post(self.MUSIC_GEN_URL, headers=headers, json=payload)
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
            audio_file_path = f"{self.cache_dir}/{self.file_name}_audio.wav"
            self.save_audio(audio, audio_file_path)
                            
            # Combine Audio with the video file
            clip = VideoFileClip(self.video_path)
            audio_clip = AudioFileClip(audio_file_path)

            composite_audio = CompositeAudioClip([audio_clip])
            clip.audio = composite_audio

            output_file_path = f"{self.cache_dir}/{self.file_name}_updated_audio.mp4"
            clip.write_videofile(output_file_path)

            return {"status": True, "updated_video":output_file_path,"message":"Successfully added audio to video"}
    
        except Exception as e:
            print(e)
            return {"status": False, "message": "Error adding audio to video","error":e}
