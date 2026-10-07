import os

import logging
logger = logging.getLogger(__name__)


from fastapi import HTTPException
from dotenv import load_dotenv
from google import genai



from app.schemas.complaint import (
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
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)


def analyze_complaint(
    complaintId: int,
    title: str,
    description: str,
    location: str | None = None,
    context: dict | None = None
    ) -> AIAnalysisResponse:

    if not title.strip():
        raise HTTPException(
            status_code=400,
            detail="Complaint title cannot be empty"
        )

    if not description.strip():
        raise HTTPException(
            status_code=400,
            detail="Complaint description cannot be empty"
        )

    prompt = f"""
You are an AI assistant for a college campus complaint management system.

Analyze the following complaint.

Complaint ID:
{complaintId}

Return the same complaintId in the response.
The complaintId is only an identifier. Do not use it to access or infer any database information.

Title:
{title}

Description:
{description}

Location:
{location}

Additional Context:
{context}

Classify the complaint into exactly one of these categories:
- ELECTRICAL
- PLUMBING
- NETWORKING
- FURNITURE
- CLEANING
- CIVIL
- HOSTEL
- OTHER

If a complaint contains multiple issues, choose the category that represents the most important or urgent issue.
Do not return multiple categories.

Determine the department that should handle the complaint.

Use exactly one of these departments:
- ELECTRICAL
- PLUMBING
- IT_NETWORK
- HOUSEKEEPING
- CARPENTRY
- CIVIL_MAINTENANCE
- HOSTEL_ADMIN
- GENERAL_ADMIN

Choose the department that is most appropriate for resolving the complaint.
Do not return multiple departments.

For each prediction, provide a confidence score between 0 and 1:
- category confidence
- priority confidence
- department confidence

The confidence score represents how confident you are in that specific prediction.
Do not use percentages. Return decimal values between 0 and 1.

Extract the following entities when they are explicitly present:
- block
- room
- facility
- issue

If an entity is not present or cannot be identified reliably, return null.
Do not invent or infer specific entity values.

Classify the priority into exactly one of:
- LOW
- MEDIUM
- HIGH
- CRITICAL

Priority rules:

- LOW: Minor issue with little or no immediate impact on campus activities.
- MEDIUM: Normal issue that affects some users but does not require immediate attention.
- HIGH: Serious issue affecting an important facility, many users, or normal campus operations.
- CRITICAL: Immediate safety risk, major infrastructure failure, or an issue that could cause harm or significant disruption.
- A persistent infrastructure or facility problem that has continued for several days and materially affects normal use may be HIGH even when there is no immediate safety risk.
- For example, a tap leaking continuously for nine days should be classified as HIGH.

If multiple issues are present, determine the priority based on the most serious issue.

Use CRITICAL only when the complaint clearly indicates an immediate safety risk or severe failure.
Do not assign HIGH or CRITICAL simply because the complaint sounds urgent.

Also generate a short, factual summary of the complaint.

Do not invent information that is not present in the complaint.


Return the analysis as structured JSON matching the required response schema.

The response must contain:
- complaintId
- category
- priority
- summary
- department
- confidence
- entities
- possibleRecurringIssue
- reason

Return exactly one value for category, priority, and department.

Confidence values must be numbers between 0 and 1.

Use null for entity fields that cannot be identified.

Recurring issue detection requires historical complaint evidence.

Do not mark a complaint as a recurring issue merely because the current issue has persisted for several days.

If no historical complaint data is supplied, return:
- possibleRecurringIssue: false
- reason: null

Do not include explanations outside the JSON response.

"""



    try:
        
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": AIAnalysisResponse,
            },
        )


    except Exception as e:
        logger.error("Gemini request failed: %s", e)

        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service quota exceeded. Please try again later."
            )

        raise HTTPException(
            status_code=502,
            detail="AI service failed to analyze the complaint"
        )

    try:
        return AIAnalysisResponse.model_validate_json(response.text)
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="AI returned an invalid response"
        )



def analyze_recurring(
    request: RecurringAnalysisRequest
   ) -> RecurringAnalysisResponse:

    prompt = f"""
You are an AI assistant for a college campus complaint management system.

Determine whether the current complaint may represent a recurring campus issue
by comparing it with the supplied historical complaints.

Current complaint:
{request.currentComplaint.model_dump_json()}

Historical complaints:
{[complaint.model_dump() for complaint in request.historicalComplaints]}

A complaint should be considered potentially recurring when one or more
historical complaints describe substantially the same issue, location,
facility, or problem pattern.

Do not consider a complaint recurring merely because the current issue has
continued for several days.

Return:
- possibleRecurringIssue: true or false
- reason: a short factual explanation

Do not invent historical complaints or information.
Return only structured JSON.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": RecurringAnalysisResponse,
            },
        )

    except Exception as e:
        logger.error("Gemini recurring analysis failed: %s", e)

        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service quota exceeded. Please try again later."
            )

        raise HTTPException(
            status_code=502,
            detail="AI service failed to analyze recurring issues"
        )

    try:
        return RecurringAnalysisResponse.model_validate_json(response.text)

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="AI returned an invalid recurring-analysis response"
        )




def analyze_duplicate(request: DuplicateAnalysisRequest) -> DuplicateAnalysisResponse:
    prompt = f"""
You are an AI assistant for a college campus complaint management system.

Determine whether the current complaint is likely a duplicate of one
of the supplied historical complaints.

Current complaint:
{request.currentComplaint.model_dump_json()}

Historical complaints:
{[complaint.model_dump() for complaint in request.historicalComplaints]}

A complaint should be considered a possible duplicate when it appears to
describe the same incident or the same unresolved issue as a historical
complaint.

Consider:
- Similar problem or issue
- Same or very similar location
- Similar facility or room
- Similar description of the incident

Do NOT mark a complaint as a duplicate merely because it belongs to the
same category.

If there is a likely duplicate:
- possibleDuplicate = true
- matchedComplaintId = the ID of the most similar historical complaint
- similarityReason = a short factual explanation

If there is no likely duplicate:
- possibleDuplicate = false
- matchedComplaintId = null
- similarityReason = null

Do not invent complaints or information.

Return only structured JSON.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": DuplicateAnalysisResponse,
            },
        )

    except Exception as e:
        logger.error("Gemini duplicate analysis failed: %s", e)

        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service quota exceeded. Please try again later."
            )

        raise HTTPException(
            status_code=502,
            detail="AI service failed to analyze duplicate complaints"
        )

    try:
        return DuplicateAnalysisResponse.model_validate_json(response.text)

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="AI returned an invalid duplicate-analysis response"
        )


def analyze_resolution(
    request: ResolutionAnalysisRequest
) -> ResolutionAnalysisResponse:

    prompt = f"""
You are an AI assistant for a college campus complaint management system.

Suggest a practical resolution for the following complaint.

Title:
{request.title}

Description:
{request.description}

Location:
{request.location}

Category:
{request.category}

Priority:
{request.priority}

Provide a concise, actionable resolution that campus maintenance or
administrative staff could follow.

Consider:
- The type of problem
- The location
- The priority
- Appropriate maintenance or administrative action
- Basic safety precautions when relevant

Do not invent information that is not present.

Do not claim that the issue has already been fixed.

Return only structured JSON with:
- suggestedResolution
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": ResolutionAnalysisResponse,
            },
        )

    except Exception as e:
        logger.error("Gemini resolution analysis failed: %s", e)

        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service quota exceeded. Please try again later."
            )

        raise HTTPException(
            status_code=502,
            detail="AI service failed to suggest a resolution"
        )

    try:
        return ResolutionAnalysisResponse.model_validate_json(
            response.text
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="AI returned an invalid resolution response"
        )



def analyze_admin_insights(
    request: AdminInsightRequest
) -> AdminInsightResponse:

    prompt = f"""
You are an AI assistant for a college campus administration system.

Analyze the supplied aggregated complaint statistics and identify
important operational patterns.

Complaint statistics:
- Total complaints: {request.totalComplaints}
- Pending complaints: {request.pendingComplaints}
- Resolved complaints: {request.resolvedComplaints}
- High priority complaints: {request.highPriorityComplaints}
- Critical complaints: {request.criticalComplaints}

Complaints by category:
{request.categoryCounts}

Complaints by department:
{request.departmentCounts}

Complaints by location:
{request.locationCounts}

Identify:

1. Key insights
   - Important patterns or unusual concentrations in the data.

2. Priority areas
   - Categories, departments, or locations that deserve attention.

3. Workload concerns
   - Departments or areas with high complaint volume based on the supplied data.
4. Recommended actions
   - Practical administrative actions based only on the supplied data.

Rules:
- Do not invent statistics.
- Do not claim a trend unless the supplied data supports it.
- Do not invent locations, departments, or categories.
- Keep each item concise and actionable.
- If there is insufficient evidence for a particular concern, do not fabricate one.
- Do not describe complaints as active, pending, or unresolved unless the supplied data explicitly supports that conclusion.

Return only structured JSON matching the required response schema.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": AdminInsightResponse,
            },
        )

    except Exception as e:
        logger.error("Gemini admin insight analysis failed: %s", e)

        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            raise HTTPException(
                status_code=429,
                detail="AI service quota exceeded. Please try again later."
            )

        raise HTTPException(
            status_code=502,
            detail="AI service failed to generate admin insights"
        )

    try:
        return AdminInsightResponse.model_validate_json(
            response.text
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="AI returned an invalid admin-insight response"
        )