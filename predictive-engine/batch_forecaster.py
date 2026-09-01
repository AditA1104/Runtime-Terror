"""
AgriQ - P5 Predictive Engine
Module: batch_forecaster.py
Description: Batch ML pipeline that trains models, projects 7-30 day price trajectories,
and exports price_trend_score + baseline best_day_score into daily_rates_cache.
"""

import os
import sys
import json
import argparse
import datetime
from pathlib import Path
from typing import Dict, List, Optional
import pandas as pd

# Smart import resolution
try:
    from predictive_engine.generate_dataset import generate_mandi_dataset, DEFAULT_MANDI_CENTERS, CROP_PROFILES
    from predictive_engine.model import MandiPriceForecaster
    from predictive_engine.dispatch_scorer import score_and_rank_forecasts
except ImportError:
    from generate_dataset import generate_mandi_dataset, DEFAULT_MANDI_CENTERS, CROP_PROFILES
    from model import MandiPriceForecaster
    from dispatch_scorer import score_and_rank_forecasts


def run_batch_pipeline(
    days_ahead: int = 14,
    history_days: int = 365,
    models_dir: Optional[str] = None,
    output_sql_path: Optional[str] = None,
    output_json_path: Optional[str] = None,
    start_forecast_date: Optional[datetime.date] = None,
) -> List[Dict]:
    print(f"[{datetime.datetime.now().isoformat()}] 🚀 Starting AgriQ P5 Predictive Batch Pipeline...")
    
    base_dir = Path(__file__).resolve().parent
    if models_dir is None:
        models_dir = str(base_dir / "saved_models")
    if output_sql_path is None:
        output_sql_path = str(base_dir / "sql" / "seed_daily_rates_cache.sql")
    if output_json_path is None:
        output_json_path = str(base_dir / "daily_rates_cache.json")

    os.makedirs(models_dir, exist_ok=True)

    if start_forecast_date is None:
        start_forecast_date = datetime.date.today()

    hist_start = start_forecast_date - datetime.timedelta(days=history_days)
    print(f"📊 Generating {history_days} days of historical market data (from {hist_start} to {start_forecast_date})...")
    df_history = generate_mandi_dataset(start_date=hist_start, days=history_days, random_seed=42)

    all_cache_records: List[Dict] = []
    models_trained: Dict[str, MandiPriceForecaster] = {}
    unique_crops = list(CROP_PROFILES.keys())

    print(f"🧠 Training forecasting models across {len(unique_crops)} commodities...")
    for crop in unique_crops:
        forecaster = MandiPriceForecaster(crop_type=crop, model_type="hist_gb")
        metrics = forecaster.train(df_history)
        model_path = os.path.join(models_dir, f"{crop.lower()}_model.joblib")
        forecaster.save(model_path)
        models_trained[crop] = forecaster
        print(f"  ✓ {crop:10s} | R²: {metrics['r2']:.4f} | RMSE: ₹{metrics['rmse']:.2f}")

    print(f"\n🔮 Generating {days_ahead}-day forward price trends...")
    for center in DEFAULT_MANDI_CENTERS:
        center_id = center["center_id"]
        center_name = center["center_name"]
        crop = center["crop_type"]
        forecaster = models_trained[crop]

        raw_forecasts = forecaster.forecast_trajectory(days_ahead=days_ahead)

        # Baseline scoring (0% initial load; Postgres get_best_selling_days() recomputes live penalty)
        baseline_loads: Dict[str, float] = {f["forecast_date"]: 0.0 for f in raw_forecasts}
        ranked_forecasts = score_and_rank_forecasts(
            forecast_records=raw_forecasts,
            center_loads=baseline_loads,
            penalty_weight=25.0,
            crop_type=crop
        )

        for rf in ranked_forecasts:
            all_cache_records.append({
                "crop_type": crop,
                "center_id": center_id,
                "center_name": center_name,
                "forecast_date": rf["forecast_date"],
                "predicted_price": rf["predicted_price"],
                "price_trend_score": rf["price_trend_score"],
                "best_day_score": rf["best_day_score"],
                "load_ratio": 0.0,
                "reason_text": rf["reason_text"],
                "traffic_light": rf["traffic_light"],
                "is_best_day": rf["is_best_day"],
            })

    print(f"✨ Generated {len(all_cache_records)} cached forecast entries across {len(DEFAULT_MANDI_CENTERS)} mandi centers.")

    if output_sql_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_sql_path)), exist_ok=True)
        generate_sql_seed_file(all_cache_records, output_sql_path)
        print(f"💾 SQL Seed exported to: {output_sql_path}")

    if output_json_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_json_path)), exist_ok=True)
        with open(output_json_path, "w", encoding="utf-8") as f:
            json.dump(all_cache_records, f, indent=2, ensure_ascii=False)
        print(f"💾 JSON Dump exported to: {output_json_path}")

    return all_cache_records


def generate_sql_seed_file(records: List[Dict], filepath: str) -> None:
    lines = [
        "-- =========================================================",
        "-- AgriQ — P5 Predictive Engine: Seed Data for daily_rates_cache",
        f"-- Generated at: {datetime.datetime.now().isoformat()}",
        "-- =========================================================\n",
        "INSERT INTO daily_rates_cache (crop_type, center_id, forecast_date, price_trend_score, best_day_score, reason_text, updated_at)",
        "VALUES"
    ]

    value_rows = []
    for r in records:
        crop = r["crop_type"].replace("'", "''")
        center_id = r["center_id"]
        f_date = r["forecast_date"]
        price_score = r["price_trend_score"]
        best_score = r["best_day_score"]
        reason = r["reason_text"].replace("'", "''")
        val = f"  ('{crop}', '{center_id}', '{f_date}'::DATE, {price_score}, {best_score}, '{reason}', now())"
        value_rows.append(val)

    lines.append(",\n".join(value_rows))
    lines.append("""ON CONFLICT (crop_type, center_id, forecast_date)
DO UPDATE SET
    price_trend_score = EXCLUDED.price_trend_score,
    best_day_score     = EXCLUDED.best_day_score,
    reason_text        = EXCLUDED.reason_text,
    updated_at         = now();
""")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriQ P5 Predictive Forecaster")
    parser.add_argument("--days", type=int, default=14)
    parser.add_argument("--sql-out", type=str, default=None)
    parser.add_argument("--json-out", type=str, default=None)

    args = parser.parse_args()
    run_batch_pipeline(days_ahead=args.days, output_sql_path=args.sql_out, output_json_path=args.json_out)
