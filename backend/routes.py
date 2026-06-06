import csv
import io
import os
from datetime import datetime, timedelta
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import Submission, get_db
from model import explain, predict
from schemas import (
    AdminLogin,
    OverviewResponse,
    PaginatedSubmissions,
    PredictResponse,
    StudentInput,
    SubmissionOut,
    TokenResponse,
)

load_dotenv()

router = APIRouter()
security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY", "acadai_secret_2025")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@acadai.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") != ADMIN_EMAIL:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_deepseek_advice(student_data: dict, risk_score: float, risk_label: str) -> list[str]:
    fallback = [
        "Set a consistent daily study schedule and stick to it for at least two hours each day.",
        "Reach out to your academic advisor to discuss any challenges you're facing this semester.",
        "Join a study group to stay motivated and improve your understanding of difficult subjects.",
        "Prioritize attending every class — attendance is one of the strongest predictors of success.",
        "Apply for available scholarships or financial aid programs to reduce financial stress.",
    ]

    if not DEEPSEEK_API_KEY or DEEPSEEK_API_KEY == "your_key_here":
        return fallback

    system_prompt = (
        "You are AcadAI, a warm and expert academic counselor. Based on the student data and "
        "risk score provided, give exactly 5 specific, encouraging, and actionable suggestions "
        "to help this student improve academically and avoid dropout. Format each suggestion as "
        "a single clear sentence. Be personal, warm, and motivating. Return ONLY a JSON array "
        "of 5 strings, no other text."
    )
    user_message = (
        f"Student data: {student_data}\n"
        f"Risk score: {risk_score}%\n"
        f"Risk level: {risk_label}"
    )

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.deepseek.com/chat/completions",
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "temperature": 0.7,
                },
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"].strip()

            import json
            import re

            json_match = re.search(r"\[.*\]", content, re.DOTALL)
            if json_match:
                advice = json.loads(json_match.group())
                if isinstance(advice, list) and len(advice) >= 5:
                    return [str(a) for a in advice[:5]]

            lines = [l.strip().lstrip("0123456789.-) ").strip() for l in content.split("\n") if l.strip()]
            if len(lines) >= 5:
                return lines[:5]
    except Exception:
        pass

    return fallback


@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "AcadAI API"}


@router.post("/api/predict", response_model=PredictResponse)
async def predict_student(student: StudentInput, db: Session = Depends(get_db)):
    data = student.model_dump()
    risk_score, risk_label = predict(data)
    factors = explain(data)
    advice = await get_deepseek_advice(data, risk_score, risk_label)

    submission = Submission(
        name=data["name"],
        gender=data["gender"],
        semester=data["semester"],
        age=data["age"],
        cgpa=data["cgpa"],
        attendance=data["attendance"],
        assignment_rate=data["assignment_rate"],
        study_hours=data["study_hours"],
        financial_status=data["financial_status"],
        part_time_job=data["part_time_job"],
        tuition_status=data["tuition_status"],
        scholarship=data["scholarship"],
        risk_score=risk_score,
        risk_label=risk_label,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return PredictResponse(
        risk_score=risk_score,
        risk_label=risk_label,
        factors=factors,
        advice=advice,
        submission_id=submission.id,
    )


@router.post("/api/admin/login", response_model=TokenResponse)
def admin_login(credentials: AdminLogin):
    if credentials.email != ADMIN_EMAIL or credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": credentials.email})
    return TokenResponse(access_token=token)


@router.get("/api/admin/students", response_model=PaginatedSubmissions)
def get_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    risk_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: dict = Depends(verify_token),
):
    query = db.query(Submission)
    if risk_filter and risk_filter.upper() in ("LOW", "MEDIUM", "HIGH"):
        query = query.filter(Submission.risk_label == risk_filter.upper())

    total = query.count()
    items = (
        query.order_by(Submission.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return PaginatedSubmissions(
        total=total,
        page=page,
        page_size=page_size,
        items=[SubmissionOut.model_validate(s) for s in items],
    )


@router.get("/api/admin/overview", response_model=OverviewResponse)
def get_overview(db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    submissions = db.query(Submission).all()
    total = len(submissions)
    if total == 0:
        return OverviewResponse(
            total_submissions=0,
            low_risk=0,
            medium_risk=0,
            high_risk=0,
            average_cgpa=0.0,
            average_attendance=0.0,
        )

    low = sum(1 for s in submissions if s.risk_label == "LOW")
    medium = sum(1 for s in submissions if s.risk_label == "MEDIUM")
    high = sum(1 for s in submissions if s.risk_label == "HIGH")
    avg_cgpa = sum(s.cgpa for s in submissions) / total
    avg_attendance = sum(s.attendance for s in submissions) / total

    return OverviewResponse(
        total_submissions=total,
        low_risk=low,
        medium_risk=medium,
        high_risk=high,
        average_cgpa=round(avg_cgpa, 2),
        average_attendance=round(avg_attendance, 1),
    )


@router.get("/api/admin/export")
def export_csv(db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    submissions = db.query(Submission).order_by(Submission.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "id", "name", "gender", "semester", "age", "cgpa", "attendance",
        "assignment_rate", "study_hours", "financial_status", "part_time_job",
        "tuition_status", "scholarship", "risk_score", "risk_label", "created_at",
    ])
    for s in submissions:
        writer.writerow([
            s.id, s.name, s.gender, s.semester, s.age, s.cgpa, s.attendance,
            s.assignment_rate, s.study_hours, s.financial_status, s.part_time_job,
            s.tuition_status, s.scholarship, s.risk_score, s.risk_label,
            s.created_at.isoformat() if s.created_at else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=acadai_submissions.csv"},
    )
