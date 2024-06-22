import os

from daltonize import daltonize
from moviepy.editor import VideoFileClip

# Need to set the video cache dir outside the class
os.environ['VIDEO_CACHE']= "./video_cache"

class ColorBlind:
    cache_dir = os.environ['VIDEO_CACHE']
    def __init__(self,video_path):
        self.video_path = video_path

    def daltonize_video(self,daltonize_type='d'):
        # Daltonize Types
        # d - Deuteranope
        # p - Protanope
        # t - Tritanope
        try:
            clip = VideoFileClip(self.video_path)
            clip.fl_image(lambda x: daltonize.daltonize(x,daltonize_type))
            output_file_path = f"{self.cache_dir}/{os.path.basename(self.video_path).split('.')[0]}_daltonized.mp4"
            clip.write_videofile(output_file_path)

            return {"status": True, "daltonized_video":output_file_path,"message":"Successfully daltonized video"}

        except Exception as e:
            print(e)
            return {"status": False, "message": "Error daltonizing video","error":e}
        
# Test Code
color_blind = ColorBlind("./test_videos/test1.mov")
color_blind.daltonize_video('d')
