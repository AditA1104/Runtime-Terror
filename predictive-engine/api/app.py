"""
AgriQ - P5 Predictive Engine
Module: app.py
Description: FastAPI microservice providing endpoints for price forecasts,
Smart Dispatch Best-Day rankings, and farmer Q&A lookups.
"""

import os
import json
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from predictive_engine.generate_dataset import DEFAULT_MANDI_CENTERS, CROP_PROFILES
from predictive_engine.api.qa_engine import AgriQChatbotEngine

# In-memory cached records loaded on startup
CACHED_RECORDS: List[Dict] = []
qa_engine = AgriQChatbotEngine()


def load_cached_data():
    global CACHED_RECORDS
    json_path = "/Users/adit/.gemini/antigravity/scratch/agriq/predictive_engine/daily_rates_cache.json"
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                CACHED_RECORDS = json.load(f)
                qa_engine.set_cache_records(CACHED_RECORDS)
                print(f"Loaded {len(CACHED_RECORDS)} cached rate records into memory.")
        except Exception as e:
            print(f"Warning: Failed to load {json_path}: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_cached_data()
    yield


app = FastAPI(
    title="AgriQ Predictive Engine API",
    description="Microservice for Mandi Price Forecasting, Smart Dispatch Scoring, and Farmer Q&A",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Request & Response Models
# ---------------------------------------------------------
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


# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgriQ Predictive Engine (P5)",
        "version": "2.0.0",
        "cached_records_count": len(CACHED_RECORDS)
    }


@app.get("/api/centers")
def get_mandi_centers():
    """Returns list of registered Mandi Centers."""
    return {"centers": DEFAULT_MANDI_CENTERS}


@app.get("/api/crops")
def get_crop_profiles():
    """Returns list of supported crops and their MSP / volatility parameters."""
    return {"crops": CROP_PROFILES}


@app.get("/api/rates")
def get_daily_rates(
    crop_type: Optional[str] = Query(None, description="Filter by crop (e.g. Wheat, Onion)"),
    center_id: Optional[str] = Query(None, description="Filter by center UUID")
):
    """
    Returns cached daily rates and price trend forecasts.
    """
    results = CACHED_RECORDS

    if crop_type:
        results = [r for r in results if r["crop_type"].lower() == crop_type.lower()]
    if center_id:
        results = [r for r in results if r["center_id"] == center_id]

    return {
        "count": len(results),
        "rates": results
    }


@app.get("/api/best-day")
def get_best_day_recommendation(
    crop_type: str = Query(..., description="Crop commodity name (e.g. Wheat, Mustard)"),
    center_id: Optional[str] = Query(None, description="Mandi Center UUID")
):
    """
    Computes/returns ranked calendar days for a crop with traffic-light recommendations.
    """
    matching = [
        r for r in CACHED_RECORDS
        if r["crop_type"].lower() == crop_type.lower()
        and (center_id is None or r["center_id"] == center_id)
    ]

    if not matching:
        raise HTTPException(status_code=404, detail=f"No forecast records found for crop '{crop_type}'")

    # Find the top ranked day
    best_entry = max(matching, key=lambda x: x["best_day_score"])

    return {
        "crop_type": crop_type,
        "recommended_day": best_entry["forecast_date"],
        "best_day_score": best_entry["best_day_score"],
        "predicted_price": best_entry["predicted_price"],
        "reason_text": best_entry["reason_text"],
        "traffic_light": best_entry["traffic_light"],
        "all_days": matching
    }


@app.post("/api/qa", response_model=QAResponse)
def ask_question(payload: QARequest):
    """
    Handles natural language queries from farmers / web / USSD.
    """
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
