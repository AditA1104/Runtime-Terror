"""
AgriQ - P5 Predictive Engine
Test Suite: test_predictive_engine.py
"""

import pytest
from fastapi.testclient import TestClient

try:
    from predictive_engine.generate_dataset import generate_mandi_dataset
    from predictive_engine.model import MandiPriceForecaster
    from predictive_engine.dispatch_scorer import calculate_smart_dispatch_score, generate_reason_text, score_and_rank_forecasts
    from predictive_engine.api.qa_engine import AgriQChatbotEngine
    from predictive_engine.api.app import app
except ImportError:
    from generate_dataset import generate_mandi_dataset
    from model import MandiPriceForecaster
    from dispatch_scorer import calculate_smart_dispatch_score, generate_reason_text, score_and_rank_forecasts
    from api.qa_engine import AgriQChatbotEngine
    from api.app import app


def test_dataset_generation():
    df = generate_mandi_dataset(days=60, random_seed=42)
    assert not df.empty
    assert "modal_price" in df.columns
    assert "arrival_tonnes" in df.columns
    assert df["modal_price"].min() > 0


def test_forecaster_training_and_inference():
    df = generate_mandi_dataset(days=120, random_seed=42)
    forecaster = MandiPriceForecaster(crop_type="Wheat", model_type="hist_gb")
    metrics = forecaster.train(df)
    assert "rmse" in metrics
    assert forecaster.is_trained
    forecasts = forecaster.forecast_trajectory(days_ahead=7)
    assert len(forecasts) == 7
    for f in forecasts:
        assert 0.0 <= f["price_trend_score"] <= 100.0
        assert len(f["day_name"]) == 3


def test_smart_dispatch_penalty_and_threshold_alignment():
    price_score = 80.0
    score_low = calculate_smart_dispatch_score(price_score, load_ratio=0.10, penalty_weight=25.0)
    assert score_low == pytest.approx(77.5, 0.1)

    score_heavy = calculate_smart_dispatch_score(price_score, load_ratio=0.80, penalty_weight=25.0)
    assert score_heavy == pytest.approx(60.0, 0.1)

    day_A_jammed = calculate_smart_dispatch_score(price_trend_score=85.0, load_ratio=0.90, penalty_weight=25.0)
    day_B_open = calculate_smart_dispatch_score(price_trend_score=78.0, load_ratio=0.10, penalty_weight=25.0)
    assert day_B_open > day_A_jammed


def test_reason_text_threshold_alignment():
    reason_green = generate_reason_text("Wheat", "2026-09-04", 4.5, 2450.0, 0.10, 72.0, "en")
    assert "⭐ Recommended" in reason_green
    assert "🟢 Low crowd" in reason_green

    reason_yellow = generate_reason_text("Wheat", "2026-09-04", 0.5, 2350.0, 0.50, 52.0, "en")
    assert "✓ Moderate / Fair" in reason_yellow
    assert "🟡 Normal rush" in reason_yellow

    reason_red = generate_reason_text("Wheat", "2026-09-04", -3.0, 2200.0, 0.90, 32.0, "en")
    assert "⚠️ Avoid / Busy" in reason_red
    assert "🔴 High congestion" in reason_red


def test_qa_engine_intents():
    engine = AgriQChatbotEngine()
    res1 = engine.process_query("When is the best time to sell my wheat?", lang="en")
    assert res1["intent"] == "BEST_DAY_ADVICE"
    assert res1["crop"] == "Wheat"

    res2 = engine.process_query("Gehun ka rate kya hai?", lang="hi")
    assert res2["intent"] == "PRICE_INQUIRY"


def test_fastapi_qa_only_endpoints():
    client = TestClient(app)
    r_health = client.get("/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "healthy"

    r_qa = client.post("/api/qa", json={"query": "When should I sell cotton?", "lang": "en"})
    assert r_qa.status_code == 200
    assert "Cotton" in r_qa.json()["answer"]
