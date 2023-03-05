"""
OpenAI interface to make calls to the API with appropriate headers
"""

from typing import List
from dotenv import load_dotenv
from .webscraper import WebScraper
from .validate_schema import validate_schema
import os
import openai
import json

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def remove_newlines(string):
    in_quotes = False
    new_string = ""
    for char in string:
        if char == '"' and not in_quotes:
            in_quotes = True
            new_string += char
        elif char == '"' and in_quotes:
            in_quotes = False
            new_string += char
        elif char == '\n' and not in_quotes:
            continue
        else:
            new_string += char
    return new_string

class CVFormatter:

    CURRENT_COMPANY_NAME = ""
    CURRENT_JOB_POSITION = ""

    @staticmethod
    def process_cv(cv_pages: List[str], job_posting_url: str) -> str:
        """
        Method that takes in a CV and job posting URL and outputs enhanced CV

        Parameters:
            cv_pages (List[str]): list of text representations for each CV page
            job_posting_url (str): the url of the job posting

        Returns:
            response (str): string representation of processed CV
        """

        # Convert single url to text using scraper
        webscraper = WebScraper()
        job_posting_text = webscraper.get_text_from_url(job_posting_url)

        summary_output = CVFormatter.summarize_job_posting(job_posting_text)
        summary_output = json.loads(summary_output)  # Convert JSON string to dict
        summarised_job_posting = summary_output["summary"]
        CVFormatter.CURRENT_COMPANY_NAME, CVFormatter.CURRENT_JOB_POSITION = summary_output["company_name"], summary_output["job_position"]

        cv_body = " ".join(cv_pages)  # Join all pages together naively
        message = f'''This is a sample document for a CV customization service, where we rewrite CVs to fit job postings. Our edit retains the original facts of original CV, but rewrites and reorganizes to priortize relevant experiences, as we do not know experiences that the user has not provided.\n
                      This is the applicant's CV:\n\n
                      {cv_body}\n\n
                      This is a summary of our job posting:\n\n
                      {summarised_job_posting}\n\n
                      This is our rewritten version of the CV that has been customized to fit the job posting, correcting for a professional tone, and better formatting. Also a summary of the edits made.'''
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=message,
            max_tokens=1417
        )

        print(response["choices"][0]["text"])

        return response["choices"][0]["text"]

    @staticmethod
    def summarize_job_posting(job_posting: str) -> str:
        """
        Method to summarize a long Job Posting text content (from HTML) and return a summary
        of the key aspects covered by the job posting. This is a preprocessing step before generating
        the enhanced CV

        Parameters:
            job_posting (str): a string representation of the full Job posting text

        Results:
            result (str): a string representing the summarised job_posting
        """

        json_output_schema = '''
        {
            "summary": "A short summary of the role covering company values and desired skills listed in the job posting",
            "company_name": "The name of the company that posted the job listing",
            "job_position": "The title of the job posting"
        }
        '''
        prompt = f'''The following is a job posting we want to apply to:\n\n
        {job_posting}\n\n
        This is a schema of a JSON output containing the job posting summary, company title and job position:\n\n
        {json_output_schema}\n\n
        And this is the JSON output for this job posting following the schema above:
        '''
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=prompt,
            max_tokens=250
        )

        output = response["choices"][0]["text"]
        output = remove_newlines(output)  # Get rid of newlines for valid JSON

        try:
            # assert validate_schema(json_output_schema, output)  # Validate JSON according to desired output schema 

            return output
        except AssertionError:
            print("GPT sucks at JSON ffs")
        except Exception as e:
            print(f"Something else fucked up: {e}")


    @staticmethod
    def format_metadata(cv_file: str) -> str:
        """
        Method that takes in processed CV output as string and outputs metadata

        Parameters:
            cv_file (str): processed CV file as a string, including summary of edits

        Returns:
            response (dict): JSON response containing formatted metadata
        """

        metadata_schema = '''
        {
            "job_posting_title": "The title of the job posting",
            "company_name": "The name of the company that posted the job listing",
            "edits": ["Edit 1 made to the CV", "Edit 2 made to the CV"]
        }
        '''
        prompt = f'''The following is a CV tailored for a job posting titled "{CVFormatter.CURRENT_JOB_POSITION}" for company "{CVFormatter.CURRENT_COMPANY_NAME}", followed by a list of edits and their justification:\n\n
                     {cv_file}\n\n
                     This is the schema for a JSON representation of the metadata for the job posting:\n\n
                     {metadata_schema}\n\n
                     This is a JSON object containing metadata following the schema above:
                  '''
        
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=prompt,
            max_tokens=2110
        )

        output = response['choices'][0]['text']
        output = remove_newlines(output)  # Get rid of newlines for valid JSON

        return output


    @staticmethod
    def format_cv_file(cv_file: str) -> dict:
        """
        Method to format preprocessed CV as JSON to enable rendering

        Parameters:
            cv_file (str): the processed CV file as a string, including summary of edits

        Returns:
            response (dict): JSON response containing formatted CV
        """

        schema_cv_json = '''
        [
            {
                "type": "div",
                "content": [
                    "p": "Applicant Name",
                    "p": "Applicant Email",
                    "p": "Applicant Address",
                    "p": "Applicant Phone Number",
                ]
            },
            {
                "type": "h1",
                "content": "Heading"
            },
            {
                "type": "div",
                "content": "This is some body text",
            },
            {
                "type": "h2",
                "content": "Skills"
            },
            {
                "type": "bullet",
                "content": ["Skill 1", "Skill 2"]
            }
        ]
        '''

        schema_cv_ts = '''
        export type RawCVComponentObject = {
            type: "bullet" | "p" | "h1" | "h2" | "h3" | "div"
            content: RawCVComponentChildren
        }

        export type RawCVComponentChildren = string | ((RawCVComponentObject | string)[])

        export type RawCVObject = RawCVComponentObject[]
        '''

        prompt = f'''The following is a CV tailored for a job posting titled "{CVFormatter.CURRENT_JOB_POSITION}" for company "{CVFormatter.CURRENT_COMPANY_NAME}", followed by a list of edits and their justification:\n\n
                      {cv_file}\n\n
                      This is the schema for a JSON representation of the CV:\n\n                      
                      {schema_cv_json}\n\n
                      The same schema is presented below as it would appear in TypeScript:\n\n
                      {schema_cv_ts}\n\n
                      The following is a JSON object representing the CV using this schema:'''
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=prompt,
            max_tokens=2048
        )

        output = response['choices'][0]['text']
        print(f"Raw Output String: {output}")
        output = remove_newlines(output)  # Get rid of newlines for valid JSON

        try:
            # assert validate_schema(json_output_schema, output)  # Validate JSON according to desired output schema 

            return output
        except AssertionError:
            print("GPT sucks at JSON ffs")
        except Exception as e:
            print(f"Something else fucked up: {e}")

