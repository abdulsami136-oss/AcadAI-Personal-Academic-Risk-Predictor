from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./acadai.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    semester = Column(Integer, nullable=False)
    age = Column(Integer, nullable=False)
    cgpa = Column(Float, nullable=False)
    attendance = Column(Float, nullable=False)
    assignment_rate = Column(Float, nullable=False)
    study_hours = Column(Float, nullable=False)
    financial_status = Column(String, nullable=False)
    part_time_job = Column(String, nullable=False)
    tuition_status = Column(String, nullable=False)
    scholarship = Column(String, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_label = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
