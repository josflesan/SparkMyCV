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
openai.api_key = os.getenv("OPEN_API_KEY")

class CVFormatter:

    @staticmethod
    def preprocess_cv(cv_pages: List[str], job_posting_url: str):
        """
        Method that takes in a CV and preprocesses it to enhance it
        """

        message = [{"role": "system", "content": f"THE PROMPT"}]
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=message
        )

        return response


    @staticmethod
    def format_cv_file(cv_file: str):
        """
        Method to format preprocessed CV as JSON to allow rendering
        """

        message = [{"role": "system", "content": f"THE PROMPT"}]
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=message
        )

        return response

