# AcadAI — Personal Academic Risk Predictor

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![ML](https://img.shields.io/badge/ML-Scikit--learn-F7931E?logo=scikit-learn&logoColor=white)

A full-stack web app where students complete a multi-step form and receive an ML-powered dropout risk score plus personalized AI advice from DeepSeek.

## Features

- Multi-step animated student form (Framer Motion)
- Random Forest classifier trained on Kaggle Student Dropout dataset
- Risk meter, factor charts, confetti for low risk, PDF export
- DeepSeek AI academic counseling (5 personalized tips)
- Admin dashboard with JWT auth, charts, and CSV export
- Railway deployment configs included

## SDG & Vision Alignment

- **SDG 4** — Quality Education
- **Vision 2030** — Digital transformation of education in Pakistan
- **Vision 2035** — Inclusive, technology-driven higher education

## Quick Start

### Backend

`ash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # then fill in DEEPSEEK_API_KEY
uvicorn main:app --reload --port 8000
`

### Frontend

`ash
cd frontend
npm install
cp .env.example .env
npm run dev
`

Open http://localhost:5173

### Admin

- Email: dmin@acadai.com
- Password: dmin123 (change in production)

## Environment Variables

| Backend (ackend/.env) | Frontend (rontend/.env) |
|---|---|
| DEEPSEEK_API_KEY | VITE_API_URL |
| ADMIN_EMAIL | |
| ADMIN_PASSWORD | |
| SECRET_KEY | |

Copy from .env.example files. **Never commit .env files.**

## Deployment (Railway)

1. Deploy ackend/ as one service — set all backend env vars
2. Deploy rontend/ as another — set VITE_API_URL to backend URL
3. Model auto-trains on first startup from data/student.csv

## Project Structure

`
AcadAI/
├── frontend/     React + Vite + Tailwind
├── backend/      FastAPI + SQLAlchemy + ML
├── data/         student.csv (Kaggle dataset)
└── model/        acadai_model.pkl (auto-generated)
`

## Screenshots

| Landing | Form | Results | Admin |
|:---:|:---:|:---:|:---:|
| _add screenshot_ | _add screenshot_ | _add screenshot_ | _add screenshot_ |

---

Built with love for SDG 4.
