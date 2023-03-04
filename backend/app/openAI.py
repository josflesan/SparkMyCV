"""
OpenAI interface to make calls to the API with appropriate headers
"""

from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

class OpenAI:

    @staticmethod
    def something(x):
        pass



