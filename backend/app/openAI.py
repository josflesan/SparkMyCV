"""
OpenAI interface to make calls to the API with appropriate headers
"""

from typing import List
from dotenv import load_dotenv
import os
import openai
import json
import requests

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

class OpenAI:

    HEADERS = {
        f"Authorization: Bearer {api_key}"
    }

    @staticmethod
    def preprocess_cv(cv_file: str, job_posting_url: str):
        """
        Method that takes in a CV and preprocesses it to enhance it
        """
        payload = {
            "model": "gpt-3.5-turbo",
            "prompt": f'''Could you please tailor this CV to this job posting {job_posting_url}'''
        }
        pass


    @staticmethod
    def format_cv_file(cv_file: str):
        
        payload = {
            "model": "gpt-3.5-turbo",
            "prompt": f'''Please format this textfile as JSON for me:\n {cv_file}''',
            "max_tokens": 4000,
        }
        requests.get("https://api.openai.com/v1/completions", data=json.dumps(payload), headers=OpenAI.HEADERS)

