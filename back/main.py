from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 許可するオリジンを指定
    allow_credentials=True,
    allow_methods=["*"],  # 許可するHTTPメソッドを指定
    allow_headers=["*"],  # 許可するHTTPヘッダーを指定
)

@app.post("/transcribe/")
async def transcribe(file: UploadFile = File(...)):
    # Save the uploaded file temporarily
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())

    # Remove the temporary file
    os.remove(file_location)

    # Return the transcript and summary
    return {
        "transcript": "This is a sample transcript.",
        "summary": "This is a sample summary."
    }
