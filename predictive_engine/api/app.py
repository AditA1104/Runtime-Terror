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

# 1. ADDED: New security imports from FastAPI
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from .qa_engine import AgriQChatbotEngine
except (ImportError, ValueError):
    try:
        from qa_engine import AgriQChatbotEngine
    except ImportError:
        from predictive_engine.api.qa_engine import AgriQChatbotEngine

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

# 2. CHANGED: Strict CORS Policy
# Replaced "*" wildcard with actual frontend domains
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS", 
    "https://agriq.gov.in,https://www.agriq.gov.in,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True, # Changed to True to support secure headers
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# 3. API Key Authentication Logic
# No hardcoded fallback: this repo is public, so any default value here is
# effectively already leaked. Require QNA_API_KEY to be set in the actual
# deployment environment (Render/Railway secret, GH Actions secret, etc).
API_KEY = os.environ.get("QNA_API_KEY")
if not API_KEY:
    raise RuntimeError(
        "QNA_API_KEY is not set. Set it in the deployment environment before "
        "starting this service — there is no default value."
    )
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Could not validate API credentials.")
    return api_key

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
    # Health checks usually remain open so uptime monitors can ping them
    return {
        "status": "healthy",
        "service": "AgriQ Q&A Assistant (P5 Stretch Goal)",
        "version": "2.0.0",
        "reference_records_count": len(CACHED_RECORDS)
    }

# 4. CHANGED: Endpoint Protection
# Injected the verify_api_key dependency into the route
@app.post("/api/qa", response_model=QAResponse, dependencies=[Depends(verify_api_key)])
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