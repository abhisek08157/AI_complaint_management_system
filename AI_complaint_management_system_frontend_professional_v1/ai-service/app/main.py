from fastapi import FastAPI

from app.schemas.complaint import (
    ComplaintRequest,
    RecurringAnalysisRequest,
    DuplicateAnalysisRequest,
    ResolutionAnalysisRequest,
    AdminInsightRequest
)

from app.services.ai_service import (
    analyze_complaint,
    analyze_recurring,
    analyze_duplicate,
    analyze_resolution,
    analyze_admin_insights
)

app = FastAPI()


@app.get("/")
def root():
    return {"message": "AI service is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/analyze/complaint")
def analyze(complaint: ComplaintRequest):
    return analyze_complaint(
        complaint.complaintId,
        complaint.title,
        complaint.description,
        complaint.location,
        complaint.context
    )


@app.post("/api/v1/analyze/recurring")
def analyze_recurring_complaint(request: RecurringAnalysisRequest):
    return analyze_recurring(request)


@app.post("/api/v1/analyze/duplicate")
def analyze_duplicate_complaint(request: DuplicateAnalysisRequest):
    return analyze_duplicate(request)

@app.post("/api/v1/analyze/resolution")
def analyze_resolution_complaint(request: ResolutionAnalysisRequest):
    return analyze_resolution(request)

@app.post("/api/v1/analyze/admin-insights")
def analyze_admin_insights_endpoint(request: AdminInsightRequest):
    return analyze_admin_insights(request)