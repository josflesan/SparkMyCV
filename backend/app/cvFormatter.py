"""
OpenAI interface to make calls to the API with appropriate headers
"""

from typing import List
from dotenv import load_dotenv
from webscraper import WebScraper
import os
import openai
import json
import requests

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

class CVFormatter:

    @staticmethod
    def process_cv(cv_pages: List[str], job_posting_url: str):
        """
        Method that takes in a CV and job posting URL and outputs enhanced CV
        """

        # Convert single url to text using scraper
        webscraper = WebScraper()
        job_posting_text = webscraper.get_text_from_url(job_posting_url)

        cv_body = " ".join(cv_pages)  # Join all pages together naively
        message = [{"role": "system", 
                    "content": f'''Here is my CV:\n\n
                                   {cv_body}\n\n
                                   Here is a job posting that I am interested in applying to:\n\n
                                   {job_posting_text}\n\n
                                   Please can you edit my CV to tailor for this job? I want it to be truthful please'''}]
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

        '''
        Can you convert the following CV into JSON please?

        ...
        
        '''

        message = [{"role": "system", "content": f"THE PROMPT"}]
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=message
        )

        return response

