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

    cv_dummy = "[    {        \"type\": \"div\",        \"content\": [\"Anish Thapa\", \"111 New Road, Stoke Gifford, Bristol 07869 405140 anishsarum@gmail.com\"]    },    {        \"type\": \"h1\",        \"content\": \"PROFILE\"    },    {        \"type\": \"div\",        \"content\": \"A highly motivated and passionate Computer Science student with proven problem-solving skills. Demonstrated by my code optimisations at Doodle Learning, resulting in a 25% reduction in memory usage and participation in the Edinburgh University Formula Student (EUFS) team, I am eager to further develop my skill set as opportunities arise. Backed by several internships, I am highly organized and possess the determination to excel academically.\"    },    {        \"type\": \"h1\",        \"content\": \"EXPERIENCE\"    },    {        \"type\": \"div\",        \"content\": \"Backend Software Engineer, Mission Labs; North West UK June 2023 - Present\"     },    {         \"type\": \"bullet\",        \"content\": [\"Eager to contribute to product development using Node.js, React, EC2, Lambda, API-Gateway, Dynamo, Kinesis, Java/Kotlin and Swift/Swift UI technologies.\"]    },    {        \"type\": \"div\",        \"content\": \"Software Engineer Intern, Doodle Learning; Bath, UK May 2022 - September 2022\"    },    {        \"type\": \"bullet\",        \"content\": [\"Invited to re-intern, achieving a high level of appreciation from peers.\", \"Developed programming expertise in C#, debugging code, and working on new app features.\", \"Experienced a seamless acquisition process during my tenure, as Discovery Education acquired the firm.\"]    },    {        \"type\": \"div\",        \"content\": \"Software Infrastructure Engineer, EUFS; Edinburgh, UK October 2021 - May 2022\"    },    {        \"type\": \"bullet\",        \"content\": [\"Part of a successful team that won in the simulation category.\", \"Developed knowledge of ROS (Python and C++) and Gazebo to create accurate simulations.\", \"Upgraded the bicycle model to create an improved four wheel sim.\"]    },    {        \"type\": \"div\",        \"content\": \"Software Engineer Intern, Doodle Learning; Bath, UK May 2021 - September 2021\"    },    {        \"type\": \"bullet\",        \"content\": [\"Displayed proficiency in using C#, debugging code, and implementing new features.\", \"Worked collaboratively on code reviews and pair programming exercises.\", \"Met deadlines for version releases, fixing critical bugs.\", \"Made multiple code optimisations leading to a 25% reduction in memory usage.\"]    },    {        \"type\": \"h1\",        \"content\": \"PROJECTS\"    },    {        \"type\": \"div\",        \"content\": \"Turn-Based Strategy Game - Python\"    },    {        \"type\": \"bullet\",        \"content\": [\"Utilised Python and PyGame to develop a 4-player strategy game with 4 diﬀerent unit types and balancing.\", \"https://github.com/anishsarum/triumph-strategy\"]    },    {        \"type\": \"div\",        \"content\": \"Sudoku Solver - Python\"    },    {        \"type\": \"bullet\",        \"content\": [\"Applied backtracking to Python code to produce a 2D list representation of solved board. Graphical interface displays backtracking process via PyGame.\", \"https://github.com/anishsarum/sudoku-solver\"]    },    {        \"type\": \"div\",        \"content\": \"Tic-Tac-Toe AI - Python\"    },    {        \"type\": \"bullet\",        \"content\": [\"Minimax algorithm to process 2D representations of tic-tac-toe boards, while allowing user to play against the AI.\", \"https://github.com/anishsarum/tictactoe-ai\"]    },    {        \"type\": \"h1\",        \"content\": \"EDUCATION\"    },    {        \"type\": \"div\",        \"content\": \"Kingswood School, Bath, UK - A Level Maths, F.Maths, CS, Physics 2018-2020 (A*, A, A, A)\"    },    {        \"type\": \"div\",        \"content\": \"University of Edinburgh, Edinburgh, UK - BSc Computer Science 2020-2024 (Average First (A) Year 1 & 2)\"    },    {        \"type\": \"h1\",        \"content\": \"SKILLS\"    },    {        \"type\": \"bullet\",        \"content\": [\"Node.js, React, EC2, Lambda, API-Gateway, Dynamo, Kinesis, Java/Kotlin and Swift/Swift UI - Relevant to the current position.\", \"C# & C++ - Extensively used during internships and time as software engineer at Engineering University formulas.\", \"Python - Since 2013, developed skills through A Levels and university modules.\", \"Java, C and Haskell - Gained knowledge through university modules.\", \"Jira & Git - Applied in internships and engineering university formulas.\"]    }]"
    metadata_dummy =                                              "{    \"job_posting_title\": \"Software Engineer - JavaScript, Node.js, Typescript\",    \"company_name\": \"CircleLoop\",    \"edits\": [              \"Changed opening profile of the applicant to better emphasize the problem solving skills and eagerness to develop at the current position\",              \"Updated job experience section by adding a new role for the job listing for 'Backend Software Engineer, Mission Labs' and rearranged the order to prioritize more relevant experience\",              \"Added/modified skills section to better emphasize skill set related to the job listing, as well as Python, Java, C, and Haskell, which were learned through university modules\",              \"Formatted and professionalized the CV according to the job listing\"             ]    }"

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

