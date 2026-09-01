"""
AgriQ - P5 Predictive Engine
Module: app.py
Description: Lightweight FastAPI microservice strictly scoped to Farmer Q&A (Stretch Goal).
IMPORTANT: P2 (Farmer App) and P4 (USSD) query Supabase directly (via get_best_selling_days RPC
and daily_rates_cache table) as the single source of truth.
"""

import os
import json
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from predictive_engine.api.qa_engine import AgriQChatbotEngine
except ImportError:
    from api.qa_engine import AgriQChatbotEngine

CACHED_RECORDS: List[Dict] = []
qa_engine = AgriQChatbotEngine()


def load_cached_data():
    global CACHED_RECORDS
    base_dir = Path(__file__).resolve().parent.parent
    json_path = os.environ.get("RATES_CACHE_FILE", str(base_dir / "daily_rates_cache.json"))

    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                CACHED_RECORDS = json.load(f)
                qa_engine.set_cache_records(CACHED_RECORDS)
                print(f"[AgriQ Q&A] Loaded {len(CACHED_RECORDS)} cached reference records from {json_path}")
        except Exception as e:
            print(f"[AgriQ Q&A] Warning: Failed to load {json_path}: {e}")
    else:
        print(f"[AgriQ Q&A] Notice: No local rates cache found at {json_path}. NLP fallback active.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_cached_data()
    yield


app = FastAPI(
    title="AgriQ Q&A Natural Language Assistant",
    description="Dedicated microservice for Farmer Q&A inquiries (SIH 2026 PS 26032 Stretch Goal). Core rates and best-day calculations are handled directly in Supabase.",
    version="2.0.0",
    lifespan=lifespan,
)

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class QARequest(BaseModel):
    query: str
    crop: Optional[str] = None
    center_id: Optional[str] = None
    lang: Optional[str] = "en"


class QAResponse(BaseModel):
    query: str
    intent: str
    crop: Optional[str]
    answer: str
    details: Optional[Dict[str, Any]] = None


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgriQ Q&A Assistant (P5 Stretch Goal)",
        "version": "2.0.0",
        "reference_records_count": len(CACHED_RECORDS)
    }


@app.post("/api/qa", response_model=QAResponse)
def ask_question(payload: QARequest):
    res = qa_engine.process_query(payload.query, lang=payload.lang or "en")
    return QAResponse(
        query=payload.query,
        intent=res.get("intent", "GENERAL_HELP"),
        crop=res.get("crop"),
        answer=res.get("answer", "No advice available."),
        details=res.get("details")
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
