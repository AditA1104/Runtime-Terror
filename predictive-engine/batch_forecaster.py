"""
AgriQ - P5 Predictive Engine
Module: batch_forecaster.py
Description: Main batch processing script that trains ML models across APMC crops & centers,
generates 7-30 day price forecasts, computes Smart Dispatch scores, and exports/syncs
into the Supabase `daily_rates_cache` table.
"""

import os
import sys
import json
import argparse
import datetime
from typing import Dict, List, Optional
import pandas as pd

from predictive_engine.generate_dataset import generate_mandi_dataset, DEFAULT_MANDI_CENTERS, CROP_PROFILES
from predictive_engine.model import MandiPriceForecaster
from predictive_engine.dispatch_scorer import score_and_rank_forecasts


def run_batch_pipeline(
    days_ahead: int = 14,
    history_days: int = 365,
    models_dir: str = "/Users/adit/.gemini/antigravity/scratch/agriq/predictive_engine/saved_models",
    output_sql_path: Optional[str] = None,
    output_json_path: Optional[str] = None,
    supabase_sync: bool = False,
    simulated_congestion: bool = True,
    start_forecast_date: Optional[datetime.date] = None,
) -> List[Dict]:
    """
    Executes end-to-end ML training, forecasting, scoring, and caching.
    """
    print(f"[{datetime.datetime.now().isoformat()}] 🚀 Starting AgriQ P5 Predictive Batch Pipeline...")
    os.makedirs(models_dir, exist_ok=True)

    if start_forecast_date is None:
        start_forecast_date = datetime.date.today()

    # 1. Generate / Load Historical Market Training Data
    hist_start = start_forecast_date - datetime.timedelta(days=history_days)
    print(f"📊 Generating/Loading {history_days} days of historical market data (from {hist_start} to {start_forecast_date})...")
    df_history = generate_mandi_dataset(start_date=hist_start, days=history_days, random_seed=42)

    # 2. Iterate through Mandi Centers & Crops
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
        print(f"  ✓ Model trained for {crop:10s} | R²: {metrics['r2']:.4f} | RMSE: ₹{metrics['rmse']:.2f} | Saved: {os.path.basename(model_path)}")

    # 3. Generate Forecasts & Scores for Each Mandi Center
    print(f"\n🔮 Generating {days_ahead}-day forward price trends & smart dispatch scores...")

    for center in DEFAULT_MANDI_CENTERS:
        center_id = center["center_id"]
        center_name = center["center_name"]
        crop = center["crop_type"]
        forecaster = models_trained[crop]

        raw_forecasts = forecaster.forecast_trajectory(days_ahead=days_ahead)

        # Simulate or query live booking load for each forecast date
        simulated_loads: Dict[str, float] = {}
        for idx, item in enumerate(raw_forecasts):
            f_date = item["forecast_date"]
            if simulated_congestion:
                # Realistic booking distribution: peak days have high booking ratio
                day_obj = datetime.datetime.strptime(f_date, "%Y-%m-%d").date()
                weekday = day_obj.weekday()
                if weekday in [0, 4]:  # Monday / Friday peak
                    simulated_loads[f_date] = 0.82
                elif weekday in [1, 2]:  # Tuesday / Wednesday moderate
                    simulated_loads[f_date] = 0.45
                elif weekday == 6:  # Sunday closed/low
                    simulated_loads[f_date] = 0.10
                else:  # Thursday / Saturday
                    simulated_loads[f_date] = 0.25
            else:
                simulated_loads[f_date] = 0.20

        # Apply Smart Dispatch Scoring
        ranked_forecasts = score_and_rank_forecasts(
            forecast_records=raw_forecasts,
            center_loads=simulated_loads,
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
                "load_ratio": rf["load_ratio"],
                "reason_text": rf["reason_text"],
                "traffic_light": rf["traffic_light"],
                "is_best_day": rf["is_best_day"],
            })

    print(f"✨ Generated {len(all_cache_records)} cached forecast entries across {len(DEFAULT_MANDI_CENTERS)} mandi centers.")

    # 4. Export SQL Seed Script
    if output_sql_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_sql_path)), exist_ok=True)
        generate_sql_seed_file(all_cache_records, output_sql_path)
        print(f"💾 SQL Seed exported to: {output_sql_path}")

    # 5. Export JSON Output
    if output_json_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_json_path)), exist_ok=True)
        with open(output_json_path, "w", encoding="utf-8") as f:
            json.dump(all_cache_records, f, indent=2, ensure_ascii=False)
        print(f"💾 JSON Dump exported to: {output_json_path}")

    # 6. Optional Direct Supabase Sync
    if supabase_sync:
        sync_to_supabase_table(all_cache_records)

    return all_cache_records


def generate_sql_seed_file(records: List[Dict], filepath: str) -> None:
    """
    Writes valid SQL INSERT statements with ON CONFLICT resolution into daily_rates_cache.
    """
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


def sync_to_supabase_table(records: List[Dict]) -> bool:
    """
    Pushes records directly to Supabase using HTTP REST API with service_role key.
    """
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        print("⚠️ Supabase credentials not set (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY). Skipping live DB push.")
        return False

    import requests
    endpoint = f"{supabase_url.rstrip('/')}/rest/v1/daily_rates_cache"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    payload = [
        {
            "crop_type": r["crop_type"],
            "center_id": r["center_id"],
            "forecast_date": r["forecast_date"],
            "price_trend_score": r["price_trend_score"],
            "best_day_score": r["best_day_score"],
            "reason_text": r["reason_text"],
        }
        for r in records
    ]

    try:
        response = requests.post(endpoint, headers=headers, json=payload, timeout=15)
        if response.status_code in [200, 201]:
            print(f"✅ Successfully synced {len(payload)} records to Supabase daily_rates_cache!")
            return True
        else:
            print(f"❌ Supabase sync failed ({response.status_code}): {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error during Supabase sync: {e}")
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriQ P5 Predictive Forecaster & Dispatch Scorer")
    parser.add_argument("--days", type=int, default=14, help="Forecast horizon in days (default: 14)")
    parser.add_argument("--sql-out", type=str, default="/Users/adit/.gemini/antigravity/scratch/agriq/sql/seed_daily_rates_cache.sql", help="Path to write SQL seed file")
    parser.add_argument("--json-out", type=str, default="/Users/adit/.gemini/antigravity/scratch/agriq/predictive_engine/daily_rates_cache.json", help="Path to write JSON dump")
    parser.add_argument("--sync-db", action="store_true", help="Sync directly to Supabase table via REST API")

    args = parser.parse_args()
    run_batch_pipeline(
        days_ahead=args.days,
        output_sql_path=args.sql_out,
        output_json_path=args.json_out,
        supabase_sync=args.sync_db
    )
