"""
AgriQ - P5 Predictive Engine
Test Suite: test_predictive_engine.py
Covers: Data Generation, ML Training & Forecasting, Dispatch Scoring, SQL Generation, Q&A NLP, and FastAPI.
"""

import pytest
import datetime
import pandas as pd
from fastapi.testclient import TestClient

from predictive_engine.generate_dataset import generate_mandi_dataset, CROP_PROFILES, DEFAULT_MANDI_CENTERS
from predictive_engine.model import MandiPriceForecaster
from predictive_engine.dispatch_scorer import calculate_smart_dispatch_score, generate_reason_text, score_and_rank_forecasts
from predictive_engine.batch_forecaster import run_batch_pipeline
from predictive_engine.api.qa_engine import AgriQChatbotEngine
from predictive_engine.api.app import app


# ---------------------------------------------------------
# 1. Dataset Generation Tests
# ---------------------------------------------------------
def test_dataset_generation():
    df = generate_mandi_dataset(days=60, random_seed=42)
    assert not df.empty
    assert "modal_price" in df.columns
    assert "arrival_tonnes" in df.columns
    assert "crop_type" in df.columns
    assert df["modal_price"].min() > 0
    assert len(df) >= 60 * 5  # At least 60 days * 5 centers


# ---------------------------------------------------------
# 2. ML Model Training & Forecast Tests
# ---------------------------------------------------------
def test_forecaster_training_and_inference():
    df = generate_mandi_dataset(days=120, random_seed=42)
    forecaster = MandiPriceForecaster(crop_type="Wheat", model_type="hist_gb")
    metrics = forecaster.train(df)

    assert "rmse" in metrics
    assert "r2" in metrics
    assert forecaster.is_trained

    # Test 7-day multi-step forecast
    forecasts = forecaster.forecast_trajectory(days_ahead=7)
    assert len(forecasts) == 7
    for f in forecasts:
        assert "forecast_date" in f
        assert "predicted_price" in f
        assert "price_trend_score" in f
        assert 0.0 <= f["price_trend_score"] <= 100.0


# ---------------------------------------------------------
# 3. Smart Dispatch Scoring Tests
# ---------------------------------------------------------
def test_smart_dispatch_penalty():
    # Base price score = 80
    price_score = 80.0

    # Low load (10% capacity filled) -> penalty = 0.1 * 25 = 2.5 -> score = 77.5
    score_low = calculate_smart_dispatch_score(price_score, load_ratio=0.10, penalty_weight=25.0)
    assert score_low == pytest.approx(77.5, 0.1)

    # Heavy congestion (80% capacity filled) -> penalty = 0.8 * 25 = 20.0 -> score = 60.0
    score_heavy = calculate_smart_dispatch_score(price_score, load_ratio=0.80, penalty_weight=25.0)
    assert score_heavy == pytest.approx(60.0, 0.1)

    # Congestion steering: lower price score with empty mandi beats higher price score with jammed mandi
    day_A_jammed = calculate_smart_dispatch_score(price_trend_score=85.0, load_ratio=0.90, penalty_weight=25.0)
    day_B_open = calculate_smart_dispatch_score(price_trend_score=78.0, load_ratio=0.10, penalty_weight=25.0)
    assert day_B_open > day_A_jammed  # Steers farmer to Day B!


def test_reason_text_generation():
    reason_en = generate_reason_text(
        crop_type="Wheat",
        forecast_date="2026-09-04",
        price_pct_change=4.5,
        predicted_price=2450.0,
        load_ratio=0.20,
        best_day_score=82.0,
        lang="en"
    )
    assert "Highly Recommended" in reason_en or "Recommended" in reason_en
    assert "Low crowd" in reason_en

    reason_hi = generate_reason_text(
        crop_type="Wheat",
        forecast_date="2026-09-04",
        price_pct_change=4.5,
        predicted_price=2450.0,
        load_ratio=0.20,
        best_day_score=82.0,
        lang="hi"
    )
    assert "सर्वोत्तम दिन" in reason_hi or "उपयुक्त दिन" in reason_hi


# ---------------------------------------------------------
# 4. Q&A NLP Engine Tests
# ---------------------------------------------------------
def test_qa_engine_intents():
    engine = AgriQChatbotEngine()

    # Best day intent
    res1 = engine.process_query("When is the best time to sell my wheat in mandi?", lang="en")
    assert res1["intent"] == "BEST_DAY_ADVICE"
    assert res1["crop"] == "Wheat"

    # Hindi rate inquiry
    res2 = engine.process_query("Gehun ka aaj ka bhav kya hai?", lang="hi")
    assert res2["intent"] == "PRICE_INQUIRY"
    assert res2["crop"] == "Wheat"

    # Crowd inquiry
    res3 = engine.process_query("Is Nashik mandi crowded on Monday?", lang="en")
    assert res3["intent"] == "CROWD_STATUS"


# ---------------------------------------------------------
# 5. FastAPI Endpoints Tests
# ---------------------------------------------------------
def test_fastapi_endpoints():
    client = TestClient(app)

    # Health check
    r_health = client.get("/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "healthy"

    # Mandi centers
    r_centers = client.get("/api/centers")
    assert r_centers.status_code == 200
    assert len(r_centers.json()["centers"]) == 5

    # Crop profiles
    r_crops = client.get("/api/crops")
    assert r_crops.status_code == 200
    assert "Wheat" in r_crops.json()["crops"]

    # Q&A Endpoint
    r_qa = client.post("/api/qa", json={"query": "When should I sell cotton?", "lang": "en"})
    assert r_qa.status_code == 200
    assert "Cotton" in r_qa.json()["answer"]
