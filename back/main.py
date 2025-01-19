from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncpg
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "postgresql://myuser:mypassword@localhost:5432/mydatabase"  # Update with your database credentials

async def init_db():
    return await asyncpg.connect(DATABASE_URL)

@app.post("/transcribe/")
async def transcribe(file: UploadFile = File(...)):
    # Save the uploaded file temporarily
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())

    # Simulate transcript and summary generation
    transcript = "This is a sample transcript."
    summary = "This is a sample summary."

    # Insert into the database
    conn = await init_db()
    row = await conn.fetchrow(
        """
        INSERT INTO transcript_log (filename, transcript, summary, timestamp)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        """,
        file.filename,
        transcript,
        summary,
        datetime.datetime.now()
    )
    inserted_id = row['id']
    await conn.close()

    # Remove the temporary file
    os.remove(file_location)

    print(inserted_id)

    # Return the transcript and summary
    return {
        "id": inserted_id,
        "transcript": transcript,
        "summary": summary
    }