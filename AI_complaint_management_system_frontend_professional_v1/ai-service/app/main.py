from fastapi import FastAPI

from app.schemas.complaint import (
    ComplaintRequest,
    AIAnalysisResponse,
    RecurringAnalysisRequest,
    RecurringAnalysisResponse,
    DuplicateAnalysisRequest,
    DuplicateAnalysisResponse,
    ResolutionAnalysisRequest,
    ResolutionAnalysisResponse,
    AdminInsightRequest,
    AdminInsightResponse
)

from app.services.ai_service import (
    analyze_complaint,
    analyze_recurring,
    analyze_duplicate,
    analyze_resolution,
    analyze_admin_insights
)


app = FastAPI(
    title="CampusOne AI Service",
    version="1.0.0"
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "CampusOne AI Service is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "CampusOne AI Service"
    }


# ============================================================
# COMPLAINT ANALYSIS
# ============================================================

@app.post(
    "/api/v1/analyze/complaint",
    response_model=AIAnalysisResponse
)
def complaint_analysis(
    request: ComplaintRequest
):

    return analyze_complaint(
        complaintId=request.complaintId,
        title=request.title,
        description=request.description,
        location=request.location,
        context=request.context
    )


# ============================================================
# RECURRING COMPLAINT ANALYSIS
# ============================================================

@app.post(
    "/api/v1/analyze/recurring",
    response_model=RecurringAnalysisResponse
)
def recurring_analysis(
    request: RecurringAnalysisRequest
):

    return analyze_recurring(request)


# ============================================================
# DUPLICATE COMPLAINT ANALYSIS
# ============================================================

@app.post(
    "/api/v1/analyze/duplicate",
    response_model=DuplicateAnalysisResponse
)
def duplicate_analysis(
    request: DuplicateAnalysisRequest
):

    return analyze_duplicate(request)


# ============================================================
# RESOLUTION SUGGESTION
# ============================================================

@app.post(
    "/api/v1/analyze/resolution",
    response_model=ResolutionAnalysisResponse
)
def resolution_analysis(
    request: ResolutionAnalysisRequest
):

    return analyze_resolution(request)


# ============================================================
# ADMIN INSIGHTS
# ============================================================

@app.post(
    "/api/v1/analyze/admin-insights",
    response_model=AdminInsightResponse
)
def admin_insights(
    request: AdminInsightRequest
):

    return analyze_admin_insights(request)