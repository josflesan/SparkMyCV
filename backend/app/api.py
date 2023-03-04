from cvFormatter import CVFormatter
from typing import List
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from PyPDF2 import PdfFileReader
import json

app = FastAPI()

origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
)

@app.post("/upload")
async def upload_data(cv_file: UploadFile,
                      urls: List[str]) -> dict:
    """
    Method that gets CV file as a pdf/text file and a list
    of strings representing desired job postings and returns
    new CV.

    Parameters:
        cv_file (UploadFile): A CV file as a PDF/.txt
        urls (List[str]): A list of URL job postings

    Returns:
        result (dict): result JSON with MD format of new CV
    """

    file_type = cv_file.filename.split(".")[1]  # pdf or txt
    
    print(f"Filename: {cv_file.filename}")
    print(f"File of type {file_type}")

    assert file_type == "pdf"

    pages = []  # Textual representation of each page of a CV
    try:
        # Convert file to string
        pdf = PdfFileReader(cv_file.file)
        for page in range(len(pdf.pages)):
            pages.append(pdf.pages[page].extract_text())
    except Exception:
        return {"message": "There was an error uploading the file"}
    finally:
        cv_file.file.close()

    # Preprocess the CV
    outputCVs = []
    for url in urls:
        outputCVs.append(CVFormatter.process_cv(pages, url))
    
    print(outputCVs[0])

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
