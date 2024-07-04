import os
from dotenv import load_dotenv

import json
load_dotenv()

from langchain_together import ChatTogether

class ChatTogetherAVL():
    def __init__(self, config, model):

        if(os.getenv("TOGETHER_API_KEY") is None):
            together_api_key = config['llm']['TOGETHER_API_KEY']
            prompts_dir = config['env']['PROMPTS_JSON']
        else:
            together_api_key = os.getenv("TOGETHER_API_KEY")
            prompts_dir = os.getenv("PROMPTS_JSON")

        self.together = ChatTogether(together_api_key=together_api_key,model=model)

        with open(prompts_dir) as f:
            self.prompts = json.load(f)

    def get_avl_response(self,characters,delay):
        response = ""
        final_prompt = self.prompts['templates']['avl_support_prompt']['prompt'].format(DELAY=delay,RESPONSE=','.join(characters))
        for m in self.together.stream(final_prompt):
            response += m.content

        return response
