import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "student.csv"
MODEL_PATH = BASE_DIR / "model" / "acadai_model.pkl"

FEATURE_NAMES = [
    "gender",
    "age",
    "scholarship",
    "tuition_up_to_date",
    "debtor",
    "semester_grade_1",
    "semester_grade_2",
    "attendance_ratio",
    "assignment_completion",
    "study_hours",
    "part_time_job",
    "financial_stress",
]

DISPLAY_NAMES = {
    "gender": "Gender",
    "age": "Age at Enrollment",
    "scholarship": "Scholarship Status",
    "tuition_up_to_date": "Tuition Payment",
    "debtor": "Financial Debt",
    "semester_grade_1": "Academic Performance (CGPA)",
    "semester_grade_2": "Semester Grades",
    "attendance_ratio": "Class Attendance",
    "assignment_completion": "Assignment Completion",
    "study_hours": "Daily Study Hours",
    "part_time_job": "Part-time Employment",
    "financial_stress": "Financial Stability",
}

_model_bundle = None


def _load_csv():
    for sep in ("\t", ";", ","):
        try:
            df = pd.read_csv(DATA_PATH, sep=sep, encoding="utf-8")
            df = _normalize_columns(df)
            if "Target" in df.columns and len(df.columns) > 10:
                return df
        except Exception:
            continue
    raise FileNotFoundError(f"Could not load dataset from {DATA_PATH}")


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [c.strip().strip('"') for c in df.columns]
    return df


def _extract_training_features(df: pd.DataFrame) -> pd.DataFrame:
    df = _normalize_columns(df)

    grade_col_1 = "Curricular units 1st sem (grade)"
    grade_col_2 = "Curricular units 2nd sem (grade)"
    approved_col = "Curricular units 1st sem (approved)"
    enrolled_col = "Curricular units 1st sem (enrolled)"
    eval_col = "Curricular units 1st sem (evaluations)"

    attendance_ratio = df[approved_col] / df[enrolled_col].replace(0, 1)
    assignment_completion = df[eval_col] / df[enrolled_col].replace(0, 1)
    assignment_completion = assignment_completion.clip(0, 1)

    features = pd.DataFrame(
        {
            "gender": df["Gender"].astype(float),
            "age": df["Age at enrollment"].astype(float),
            "scholarship": df["Scholarship holder"].astype(float),
            "tuition_up_to_date": df["Tuition fees up to date"].astype(float),
            "debtor": df["Debtor"].astype(float),
            "semester_grade_1": df[grade_col_1].astype(float) / 20.0,
            "semester_grade_2": df[grade_col_2].astype(float) / 20.0,
            "attendance_ratio": attendance_ratio.clip(0, 1),
            "assignment_completion": assignment_completion,
            "study_hours": (df["Admission grade"].astype(float) / 40.0).clip(0, 4),
            "part_time_job": (df["Daytime/evening attendance"].astype(float) == 0).astype(float),
            "financial_stress": (1 - df["Tuition fees up to date"].astype(float)) + df["Debtor"].astype(float),
        }
    )
    return features.fillna(0)


def _form_to_features(data: dict) -> np.ndarray:
    gender = 1.0 if str(data.get("gender", "")).lower() == "male" else 0.0
    scholarship = 1.0 if str(data.get("scholarship", "")).lower() in ("yes", "true", "1") else 0.0
    tuition_up = 1.0 if str(data.get("tuition_status", "")).lower() in ("paid", "up to date", "yes", "current") else 0.0
    financial = str(data.get("financial_status", "")).lower()
    debtor = 1.0 if financial in ("struggling", "poor", "unstable", "debt") else 0.0
    part_time = 1.0 if str(data.get("part_time_job", "")).lower() in ("yes", "true", "1") else 0.0
    financial_stress = debtor + (0.0 if tuition_up else 1.0)

    cgpa = float(data.get("cgpa", 0)) / 4.0
    attendance = float(data.get("attendance", 0)) / 100.0
    assignment = float(data.get("assignment_rate", 0)) / 100.0
    study_hours = min(float(data.get("study_hours", 0)) / 8.0, 1.0)

    return np.array(
        [
            gender,
            float(data.get("age", 20)),
            scholarship,
            tuition_up,
            debtor,
            cgpa,
            cgpa * 0.95,
            attendance,
            assignment,
            study_hours,
            part_time,
            financial_stress,
        ]
    ).reshape(1, -1)


def train_and_save():
    df = _load_csv()
    df = _normalize_columns(df)
    X = _extract_training_features(df)
    y = (df["Target"].str.strip() == "Dropout").astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=350,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    bundle = {
        "model": clf,
        "feature_names": FEATURE_NAMES,
        "display_names": DISPLAY_NAMES,
    }
    joblib.dump(bundle, MODEL_PATH)
    return bundle


def load_model():
    global _model_bundle
    if _model_bundle is not None:
        return _model_bundle

    if not MODEL_PATH.exists():
        _model_bundle = train_and_save()
    else:
        _model_bundle = joblib.load(MODEL_PATH)

    return _model_bundle


def _risk_label(score: float) -> str:
    if score < 35:
        return "LOW"
    if score < 65:
        return "MEDIUM"
    return "HIGH"


def predict(input_dict: dict) -> tuple[float, str]:
    bundle = load_model()
    clf = bundle["model"]
    features = _form_to_features(input_dict)
    proba = clf.predict_proba(features)[0]
    dropout_idx = list(clf.classes_).index(1) if 1 in clf.classes_ else -1
    dropout_prob = proba[dropout_idx] if dropout_idx >= 0 else proba[-1]
    score = round(float(dropout_prob * 100), 1)
    return score, _risk_label(score)


def _normalize_for_explain(name: str, value: float) -> float:
    if name == "age":
        return min(value / 40.0, 1.0)
    return float(np.clip(value, 0, 1))


def explain(input_dict: dict) -> list[dict]:
    bundle = load_model()
    clf = bundle["model"]
    display_names = bundle["display_names"]
    features = _form_to_features(input_dict)[0]
    importances = clf.feature_importances_

    risk_increasing = {"debtor", "part_time_job", "financial_stress", "gender"}

    contributions = []
    for i, name in enumerate(bundle["feature_names"]):
        norm_val = _normalize_for_explain(name, features[i])
        if name in risk_increasing:
            direction = "increases" if norm_val >= 0.5 else "decreases"
            severity = norm_val if direction == "increases" else 1 - norm_val
        else:
            direction = "decreases" if norm_val >= 0.5 else "increases"
            severity = 1 - norm_val if direction == "increases" else norm_val

        contributions.append({
            "factor": display_names.get(name, name),
            "direction": direction,
            "impact": round(float(importances[i] * severity * 100), 1),
        })

    contributions.sort(key=lambda x: x["impact"], reverse=True)
    return contributions[:4]
