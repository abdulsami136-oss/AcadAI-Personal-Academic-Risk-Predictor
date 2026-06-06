from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class StudentInput(BaseModel):
    name: str = Field(..., min_length=1)
    gender: str
    semester: int = Field(..., ge=1, le=8)
    age: int = Field(..., ge=16, le=60)
    cgpa: float = Field(..., ge=0.0, le=4.0)
    attendance: float = Field(..., ge=0.0, le=100.0)
    assignment_rate: float = Field(..., ge=0.0, le=100.0)
    study_hours: float = Field(..., ge=0.0, le=16.0)
    financial_status: str
    part_time_job: str
    tuition_status: str
    scholarship: str


class FactorOut(BaseModel):
    factor: str
    direction: str
    impact: float


class PredictResponse(BaseModel):
    risk_score: float
    risk_label: str
    factors: list[FactorOut]
    advice: list[str]
    submission_id: int


class AdminLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SubmissionOut(BaseModel):
    id: int
    name: str
    gender: str
    semester: int
    age: int
    cgpa: float
    attendance: float
    assignment_rate: float
    study_hours: float
    financial_status: str
    part_time_job: str
    tuition_status: str
    scholarship: str
    risk_score: float
    risk_label: str
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedSubmissions(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[SubmissionOut]


class OverviewResponse(BaseModel):
    total_submissions: int
    low_risk: int
    medium_risk: int
    high_risk: int
    average_cgpa: float
    average_attendance: float
