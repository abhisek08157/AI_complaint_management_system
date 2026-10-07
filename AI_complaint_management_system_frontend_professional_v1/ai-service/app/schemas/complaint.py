from enum import Enum
from typing import Any

from pydantic import BaseModel


class Category(str, Enum):
    ELECTRICAL = "ELECTRICAL"
    PLUMBING = "PLUMBING"
    NETWORKING = "NETWORKING"
    FURNITURE = "FURNITURE"
    CLEANING = "CLEANING"
    CIVIL = "CIVIL"
    HOSTEL = "HOSTEL"
    OTHER = "OTHER"


class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Department(str, Enum):
    ELECTRICAL = "ELECTRICAL"
    PLUMBING = "PLUMBING"
    IT_NETWORK = "IT_NETWORK"
    HOUSEKEEPING = "HOUSEKEEPING"
    CARPENTRY = "CARPENTRY"
    CIVIL_MAINTENANCE = "CIVIL_MAINTENANCE"
    HOSTEL_ADMIN = "HOSTEL_ADMIN"
    GENERAL_ADMIN = "GENERAL_ADMIN"


class ComplaintRequest(BaseModel):
    complaintId: int
    title: str
    description: str
    location: str | None = None
    context: dict[str, Any] | None = None

class HistoricalComplaint(BaseModel):
    complaintId: int
    title: str
    description: str
    location: str | None = None
    category: Category | None = None

class RecurringAnalysisRequest(BaseModel):
    currentComplaint: HistoricalComplaint
    historicalComplaints: list[HistoricalComplaint]

class RecurringAnalysisResponse(BaseModel):
    possibleRecurringIssue: bool
    reason: str | None = None

class DuplicateAnalysisRequest(BaseModel):
    currentComplaint: HistoricalComplaint
    historicalComplaints: list[HistoricalComplaint]


class DuplicateAnalysisResponse(BaseModel):
    possibleDuplicate: bool
    matchedComplaintId: int | None = None
    similarityReason: str | None = None

class Confidence(BaseModel):
    category: float
    priority: float
    department: float

class Entities(BaseModel):
    block: str | None = None
    room: str | None = None
    facility: str | None = None
    issue: str | None = None

class AIAnalysisResponse(BaseModel):
    complaintId: int
    category: Category
    priority: Priority
    summary: str
    department: Department
    confidence: Confidence
    entities: Entities
    possibleRecurringIssue: bool = False
    reason: str | None = None

class ResolutionAnalysisRequest(BaseModel):
    title: str
    description: str
    location: str | None = None
    category: Category | None = None
    priority: Priority | None = None

class ResolutionAnalysisResponse(BaseModel):
    suggestedResolution: str

class AdminInsightRequest(BaseModel):
    totalComplaints: int
    pendingComplaints: int
    resolvedComplaints: int
    highPriorityComplaints: int
    criticalComplaints: int
    categoryCounts: dict[str, int]
    departmentCounts: dict[str, int]
    locationCounts: dict[str, int]

class AdminInsightResponse(BaseModel):
    keyInsights: list[str]
    priorityAreas: list[str]
    workloadConcerns: list[str]
    recommendedActions: list[str]