from enum import Enum

from pydantic import BaseModel


class Category(str, Enum):
    ELECTRICAL = "ELECTRICAL"
    PLUMBING = "PLUMBING"
    NETWORKING = "NETWORKING"
    FURNITURE = "FURNITURE"
    CLEANING = "CLEANING"
    OTHER = "OTHER"


class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ComplaintRequest(BaseModel):
    title: str
    description: str


class AIAnalysisResponse(BaseModel):
    category: Category
    priority: Priority
    summary: str