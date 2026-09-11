from fastapi import FastAPI

from app.schemas.complaint import ComplaintRequest
from app.services.ai_service import analyze_complaint

app = FastAPI()


@app.get("/")
def root():
    return {"message": "AI service is running"}


@app.post("/analyze")
def analyze(complaint: ComplaintRequest):
    return analyze_complaint(
        complaint.title,
        complaint.description
    )