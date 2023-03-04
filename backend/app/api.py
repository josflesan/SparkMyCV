from .cvFormatter import CVFormatter
from typing import List
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfFileReader

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
    # preprocessedCV = CVFormatter.preprocess_cv(pages, urls)

    # Format CV into JSON output for rendering
    # formattedCV = CVFormatter.format_cv_file(preprocessedCV)

    # return formattedCV
