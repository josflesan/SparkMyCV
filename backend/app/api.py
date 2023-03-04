from cvFormatter import CVFormatter
from typing import List
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from PyPDF2 import PdfReader
import hashlib
import json

app = FastAPI()

file_store = {}  # Internal store of hash-value pairs for files uploaded

app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
)

@app.post("/upload")
async def upload_file(cv_file: UploadFile) -> str:
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

    return json.dumps({"response": "File uploaded correctly", "hash": filename_hash})

@app.get("/file/{file_hash}")
async def check_file_exists(file_hash: str) -> str:
    """
    Method that checks whether a file exists in the server filestore
    by using its hash.

    Parameters:
        file_hash (str): the SHA256 hash of the file's name as Hex

    Returns:
        response (str): JSON string output with single 'response' key with Boolean value representing file existence
    """
    return json.dumps({"response": file_hash in file_store})

@app.post("/enhance")
async def enhance_cv(file_hash: str,
                     job_posting_url: str) -> str:
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
    print(file_hash)
    print(job_posting_url)
    pdf_pages = file_store[file_hash]
    print(pdf_pages)

    # Preprocess the CV
    # outputCV = CVFormatter.process_cv(pdf_pages, job_posting_url)

    print(outputCV)

    return json.dumps({"result": outputCV})

    # Format CV into JSON output for rendering
    # formattedCV = CVFormatter.format_cv_file(preprocessedCV)

    # return formattedCV

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

