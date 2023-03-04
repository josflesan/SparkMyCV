from typing import List
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

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
    pass
