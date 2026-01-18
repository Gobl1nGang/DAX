from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json
from processor import process_uploaded_data

app = FastAPI()

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    files_data = []
    for file in files:
        if not file.filename.endswith('.json'):
            continue
        content = await file.read()
        try:
            files_data.append({
                "filename": file.filename,
                "content": content.decode('utf-8')
            })
        except Exception as e:
            print(f"Error reading {file.filename}: {e}")
            continue
    
    if not files_data:
        raise HTTPException(status_code=400, detail="No valid JSON files uploaded.")
    
    try:
        results = process_uploaded_data(files_data)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
