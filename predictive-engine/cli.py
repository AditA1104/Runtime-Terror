"""
AgriQ - P5 Predictive Engine
Module: cli.py
Description: Interactive command-line simulation & inspection tool for AgriQ Predictive Engine.
Demonstrates live what-if scenarios (e.g. queue congestion shifting recommendations) for hackathon demos.
"""

import sys
import argparse
import datetime
from typing import Dict, List
import pandas as pd

from predictive_engine.generate_dataset import DEFAULT_MANDI_CENTERS, CROP_PROFILES
from predictive_engine.model import MandiPriceForecaster
from predictive_engine.dispatch_scorer import (
    calculate_smart_dispatch_score,
    generate_reason_text,
    score_and_rank_forecasts,
)


def print_banner():
    print("=" * 70)
    print("🌾 AgriQ Predictive Engine & Smart Dispatch Simulator (SIH 2026)")
    print("=" * 70)


def list_available_options():
    print("\n📍 Registered Mandi Centers:")
    for idx, c in enumerate(DEFAULT_MANDI_CENTERS, 1):
        print(f"  [{idx}] {c['center_name']} ({c['district']}, {c['state']}) — Primary Crop: {c['crop_type']}")

    print("\n🌱 Supported Crops:")
    crop_list = list(CROP_PROFILES.keys())
    print("  " + ", ".join(crop_list))


def run_congestion_simulation(crop: str = "Wheat", penalty_weight: float = 25.0):
    """
    Demonstrates how smart dispatch automatically steers farmers away from crowded days.
    """
    print_banner()
    print(f"\n🔬 RUNNING WHAT-IF CONGESTION SIMULATION FOR: {crop.upper()}")
    print("-" * 70)

    # 1. Train quick model
    from predictive_engine.generate_dataset import generate_mandi_dataset
    print("Training price model on 180-day baseline...")
    df_hist = generate_mandi_dataset(days=180, random_seed=42)
    forecaster = MandiPriceForecaster(crop_type=crop)
    forecaster.train(df_hist)

    raw_forecasts = forecaster.forecast_trajectory(days_ahead=7)

    # Scenario A: All days have low crowd (20% load)
    loads_scenario_a = {f["forecast_date"]: 0.20 for f in raw_forecasts}
    ranked_a = score_and_rank_forecasts(raw_forecasts, loads_scenario_a, penalty_weight, crop)

    # Scenario B: The highest price day gets heavily crowded (85% load)
    highest_price_day = max(raw_forecasts, key=lambda x: x["predicted_price"])["forecast_date"]
    loads_scenario_b = {f["forecast_date"]: 0.20 for f in raw_forecasts}
    loads_scenario_b[highest_price_day] = 0.88  # 88% congested!

    ranked_b = score_and_rank_forecasts(raw_forecasts, loads_scenario_b, penalty_weight, crop)

    print("\n📊 SCENARIO 1: Uncongested Mandi (Normal Booking Load ~20%)")
    print(f"{'Date':12s} | {'Price (₹)':10s} | {'Trend Score':12s} | {'Load %':8s} | {'Adj Score':10s} | {'Recommendation':15s}")
    print("-" * 75)
    for r in ranked_a:
        is_rec = "⭐ BEST DAY" if r["is_best_day"] else ""
        print(f"{r['forecast_date']:12s} | ₹{r['predicted_price']:<9.0f} | {r['price_trend_score']:<12.1f} | {int(r['load_ratio']*100):<7d}% | {r['best_day_score']:<10.1f} | {is_rec}")

    print("\n🚨 SCENARIO 2: Peak Crowding Influx on Peak Day (" + highest_price_day + " at 88% Capacity)")
    print(f"{'Date':12s} | {'Price (₹)':10s} | {'Trend Score':12s} | {'Load %':8s} | {'Adj Score':10s} | {'Recommendation':15s}")
    print("-" * 75)
    for r in ranked_b:
        is_rec = "⭐ BEST DAY" if r["is_best_day"] else ("⚠️ CONGESTED" if r["load_ratio"] > 0.70 else "")
        print(f"{r['forecast_date']:12s} | ₹{r['predicted_price']:<9.0f} | {r['price_trend_score']:<12.1f} | {int(r['load_ratio']*100):<7d}% | {r['best_day_score']:<10.1f} | {is_rec}")

    best_day_a = next(r for r in ranked_a if r["is_best_day"])
    best_day_b = next(r for r in ranked_b if r["is_best_day"])

    print("\n" + "=" * 70)
    print("💡 SIMULATION OUTCOME & SMART STEERING PROOF:")
    print(f"  • In Scenario 1: Best Day was {best_day_a['forecast_date']} (Score: {best_day_a['best_day_score']})")
    print(f"  • In Scenario 2: When {highest_price_day} became jammed (88%), AgriQ shifted recommendation to:")
    print(f"    👉 {best_day_b['forecast_date']} (Score: {best_day_b['best_day_score']}, Load: {int(best_day_b['load_ratio']*100)}%)")
    print(f"  • Reason: {best_day_b['reason_text']}")
    print("=" * 70)


def main():
    parser = argparse.ArgumentParser(description="AgriQ P5 Predictive Engine CLI & Simulator")
    parser.add_argument("--simulate", action="store_true", help="Run live what-if congestion simulation")
    parser.add_argument("--crop", type=str, default="Wheat", help="Crop for simulation (default: Wheat)")
    parser.add_argument("--penalty", type=float, default=25.0, help="Congestion penalty weight (default: 25.0)")
    parser.add_argument("--list", action="store_true", help="List registered centers and supported crops")

    args = parser.parse_args()

    if args.list:
        print_banner()
        list_available_options()
    elif args.simulate:
        run_congestion_simulation(crop=args.crop, penalty_weight=args.penalty)
    else:
        print_banner()
        print("Usage:")
        print("  python -m predictive_engine.cli --simulate --crop Wheat")
        print("  python -m predictive_engine.cli --list")


if __name__ == "__main__":
    main()
