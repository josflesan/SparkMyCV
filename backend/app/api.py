from .cvFormatter import CVFormatter
from typing import List
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from PyPDF2 import PdfReader
from pydantic import BaseModel
import hashlib
import json
import functools

app = FastAPI()

file_store = {}  # Internal store of hash-value pairs for files uploaded

# Schema for /enhance request body
class EnhanceBody(BaseModel):
    file_hash: str
    job_posting_url: str

app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
)

@app.get("/dummy")
async def get_dummy_render() -> dict:
    """
    Method that returns dummy JSON data to test rendering.

    Returns:
        response (dict): JSON representing dummy API responses
    """

    cv_dummy = "[            {                \"type\": \"div\",                \"content\": [                    {                        \"type\": \"p\",                        \"content\": \"Applicant Name\"                    },                    {                        \"type\": \"p\",                        \"content\": \"Applicant Email\"                    },                    {                        \"type\": \"p\",                        \"content\": \"Applicant Address\"                    },                    {                        \"type\": \"p\",                        \"content\": \"Applicant Phone Number\"                    }                ]            },            {                \"type\": \"div\",                \"content\": [                    {                        \"type\": \"h1\",                        \"content\": \"Profile\"                    },                    {                        \"type\": \"p\",                        \"content\": \"A highly motivated and passionate Computer Science student with proven problem-solving and management skills. During my internships and participation in the Edinburgh University Formula Student (EUFS) Team, I have developed my skill set and successfully completed tasks in a timely manner. My code optimisations at Doodle Learning resulted in a 25% reduction in memory usage.\"                    }                ]            },            {                \"type\": \"div\",                \"content\": [                    {                        \"type\": \"h1\",                        \"content\": \"Experience\"                    },                    {                        \"type\": \"p\",                        \"content\": \"Software Engineer Intern, Doodle Learning; Bath, UK - MAY 2022 – SEPTEMBER 2022\"                    },                    {                        \"type\": \"bullet\",                        \"content\": [\"Developed coding proficiency in C#, debugging code, and implemented new features\", \"Provided code reviews to and from software engineers and pair programming with the team\",\"Successfully completed time-critical tasks before the next version release, as well as memory optimisations resulting in 25% reduction in usage\"]                    },                    {                        \"type\": \"p\",                        \"content\": \"Software Infrastructure Engineer, EUFS; Edinburgh, UK - OCTOBER 2021 – MAY 2022\"                    },                    {                        \"type\": \"bullet\",                        \"content\": [\"Worked on the infrastructure team, involving ROS (Python and C++) and Gazebo to make accurate car simulations\",\"Upgraded the bicycle model to a four wheel model, providing a more accurate simulation\",\"The team and myself won in the simulation category\"]                    },                    {                        \"type\": \"p\",                        \"content\": \"Software Engineer Intern, Doodle Learning; Bath, UK - MAY 2021 – SEPTEMBER 2021\"                    },                    {                        \"type\": \"bullet\",                        \"content\": [\"Practiced C#, debugging code, and the implementation of new features\",\"Worked alongside software engineers providing code reviews and pair programming\",\"Raised the bar with time critical tasks and memory optimisations resulting in 25% reduction in usage\"]                    }                ]            },            {                \"type\": \"div\",                \"content\": [                    {                        \"type\": \"h1\",                        \"content\": \"Projects\"                    },                    {                        \"type\": \"bullet\",                        \"content\": [\"Turn-Based Strategy Game (Python)\", \"Sudoku Solver (Python)\", \"Tic-Tac-Toe AI (Python)\"]                    }                ]            },            {                \"type\": \"div\",                \"content\": [                    {                        \"type\": \"h1\",                        \"content\": \"Education\"                    },                    {                        \"type\": \"p\",                        \"content\": \"Kingswood School, Bath, UK - A Level Maths, F.Maths, CS, Physics 2018-2020 (A*, A, A, A)\"                    },                    {                        \"type\": \"p\",                        \"content\": \"University of Edinburgh, Edinburgh, UK - BSc Computer Science 2020-2024 (Average First (A) Year 1 & 2)\"                    }                ]            },            {                \"type\": \"div\",                \"content\": [                    {                        \"type\": \"h1\",                        \"content\": \"Skills\"                    },                    {                        \"type\": \"bullet\",                        \"content\": [\"SC Clearance/Public sector/national security\", \"C#, Robot Framework & Unity (Doodle Learning internship)\",\"C++ & ROS (software engineering at EUFS)\",\"Python (A Levels, university modules)\",\"Java, C, Haskell (university modules)\",\"Jira & Git (internship and EUFS)\", \"Lived in the UK continuously for 10+ years\"]                    }                ]            }        ]"
    metadata_dummy =  "        {            \"job_posting_title\": \"Senior Software Engineer\",             \"company_name\": \"Sanderson\",            \"edits\": [\"Rewrote and reorganized CV to prioritize relevant experiences to job posting\", \"Corrected for a professional tone\", \"Removed unnecessary details and experiences\", \"Edited formatting\"]        }"

    return {"cv": cv_dummy, "metadata": metadata_dummy}

@functools.cache
@app.post("/upload")
async def upload_file(cv_file: UploadFile) -> dict:
    """
    Method that gets CV file as a pdf/text file and stores it in
    server's memory.

    Parameters:
        cv_file (UploadFile): A CV file as a PDF/.txt
    
    Returns:
        response (str): JSON string output containing the file hash
    """

    file_type = cv_file.filename.split(".")[1]  # pdf or txt
    assert file_type == "pdf"  #TODO: Remove this once we implement both filetypes

    pages = []  # Textual representation of each page of a CV
    try:
        # Convert file to string
        pdf = PdfReader(cv_file.file)
        for page in range(len(pdf.pages)):
            pages.append(pdf.pages[page].extract_text())

        # Hash filename using SHA256 and store in server memory
        filename_hash = hashlib.sha256(bytes(cv_file.filename, encoding="utf-8")).hexdigest()

        file_store[filename_hash] = pages

    except Exception:
        return {"err": "There was an error uploading the file"}
    finally:
        cv_file.file.close()

    return {"response": "File uploaded correctly", "file_hash": filename_hash}

@functools.cache
@app.get("/file/{file_hash}")
async def check_file_exists(file_hash: str) -> dict:
    """
    Method that checks whether a file exists in the server filestore
    by using its hash.

    Parameters:
        file_hash (str): the SHA256 hash of the file's name as Hex

    Returns:
        response (dict): JSON output with single 'response' key with Boolean value representing file existence
    """
    return {"response": file_hash in file_store}

@functools.cache
@app.post("/enhance")
async def enhance_cv(data: EnhanceBody) -> dict:
    """
    Method that takes in a file hash (as hex SHA256 output) and a job posting URL and returns an enhanced version
    of the URL tailored for the job posting.

    Parameters:
        file_hash (str): A hash representation (SHA256) of the desired file's name
        job_posting_url (str): A url pointing to the desired job posting

    Returns:
        result (dict): result JSON with MarkDown format of enhanced CV
    """

    # Get file from internal store
    pdf_pages = file_store[data.file_hash]

    # Preprocess the CV
    outputCV = CVFormatter.process_cv(pdf_pages, data.job_posting_url)

    # Format CV into JSON output for rendering
    formattedCV = CVFormatter.format_cv_file(outputCV)
    formattedMetdata = CVFormatter.format_metadata(outputCV)

    return {"cv": formattedCV,
            "metadata": formattedMetdata}

def custom_openapi():
    """
    Method to generate API schema for TS client
    """

    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Pimp My CV API",
        version="0.1.0",
        description="CV Enhancer RESTful API",
        routes=app.routes,
    )

    app.openapi_schema = openapi_schema
    
    with open('schema.json', 'w', encoding='utf-8') as f:
        json.dump(app.openapi_schema, f, ensure_ascii=False, indent=4)

