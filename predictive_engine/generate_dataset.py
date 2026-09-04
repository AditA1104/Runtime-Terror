"""
AgriQ - P5 Predictive Engine
Module: generate_dataset.py
Description: Generates high-fidelity synthetic APMC historical mandi data
(prices, modal rates, arrival quantities, seasonal waves, and weather/fuel indices)
for major Indian crops and mandi centers across 365+ days.
"""

import datetime
import math
import random
from typing import Dict, List, Optional
import numpy as np
import pandas as pd

# Default baseline price ranges (₹/quintal) and arrival volume profiles (tonnes/day)
CROP_PROFILES: Dict[str, Dict] = {
    "Wheat": {
        "base_price": 2350.0,
        "price_volatility": 65.0,
        "base_arrival": 350.0,
        "peak_months": [3, 4, 5],  # Rabi harvest
        "lean_months": [8, 9, 10],
        "msp": 2275.0,
        "trend_drift": 0.04,  # Slight upward drift
    },
    "Paddy": {
        "base_price": 2250.0,
        "price_volatility": 55.0,
        "base_arrival": 400.0,
        "peak_months": [10, 11, 12],  # Kharif harvest
        "lean_months": [5, 6, 7],
        "msp": 2183.0,
        "trend_drift": 0.03,
    },
    "Mustard": {
        "base_price": 5450.0,
        "price_volatility": 140.0,
        "base_arrival": 180.0,
        "peak_months": [2, 3, 4],
        "lean_months": [7, 8, 9],
        "msp": 5650.0,
        "trend_drift": 0.06,
    },
    "Cotton": {
        "base_price": 7100.0,
        "price_volatility": 210.0,
        "base_arrival": 220.0,
        "peak_months": [10, 11, 12, 1],
        "lean_months": [5, 6, 7],
        "msp": 7020.0,
        "trend_drift": 0.05,
    },
    "Chana": {
        "base_price": 5850.0,
        "price_volatility": 120.0,
        "base_arrival": 160.0,
        "peak_months": [3, 4, 5],
        "lean_months": [9, 10, 11],
        "msp": 5440.0,
        "trend_drift": 0.04,
    },
    "Soybean": {
        "base_price": 4750.0,
        "price_volatility": 115.0,
        "base_arrival": 280.0,
        "peak_months": [10, 11, 12],
        "lean_months": [4, 5, 6],
        "msp": 4600.0,
        "trend_drift": 0.035,
    },
    "Maize": {
        "base_price": 2150.0,
        "price_volatility": 48.0,
        "base_arrival": 240.0,
        "peak_months": [9, 10, 11],
        "lean_months": [3, 4, 5],
        "msp": 2090.0,
        "trend_drift": 0.025,
    },
    "Onion": {
        "base_price": 2100.0,
        "price_volatility": 420.0,  # High volatility
        "base_arrival": 320.0,
        "peak_months": [12, 1, 2, 3],
        "lean_months": [8, 9, 10],  # Monsoon price spike
        "msp": 0.0,
        "trend_drift": 0.08,
    },
    "Potato": {
        "base_price": 1450.0,
        "price_volatility": 180.0,
        "base_arrival": 450.0,
        "peak_months": [1, 2, 3],
        "lean_months": [7, 8, 9],
        "msp": 0.0,
        "trend_drift": 0.03,
    },
    "Tomato": {
        "base_price": 1850.0,
        "price_volatility": 480.0,
        "base_arrival": 260.0,
        "peak_months": [11, 12, 1],
        "lean_months": [6, 7, 8],
        "msp": 0.0,
        "trend_drift": 0.09,
    },
}

# =========================================================
# Mandi Centers — loaded LIVE from Supabase when credentials are available.
# Falls back to placeholder data (clearly fake IDs) ONLY for offline/local
# testing when SUPABASE_URL / SUPABASE_ANON_KEY aren't set. Never assume
# the fallback IDs match your real database — they won't, and inserting
# against them will fail the foreign key constraint on daily_rates_cache.
# =========================================================
import os
from dotenv import load_dotenv
load_dotenv()  # loads .env from repo root automatically if present

_PLACEHOLDER_MANDI_CENTERS = [
    {
        "center_id": "c1111111-1111-1111-1111-111111111111",  # FAKE — offline testing only
        "center_name": "Nashik APMC Main Market",
        "district": "Nashik",
        "state": "Maharashtra",
        "crop_type": "Onion",
        "daily_capacity_kg": 50000,
        "hourly_intake_limit": 25,
    },
    {
        "center_id": "c2222222-2222-2222-2222-222222222222",  # FAKE — offline testing only
        "center_name": "Khanna Grain Mandi",
        "district": "Ludhiana",
        "state": "Punjab",
        "crop_type": "Wheat",
        "daily_capacity_kg": 100000,
        "hourly_intake_limit": 40,
    },
    {
        "center_id": "c3333333-3333-3333-3333-333333333333",  # FAKE — offline testing only
        "center_name": "Indore Krishi Upaj Mandi",
        "district": "Indore",
        "state": "Madhya Pradesh",
        "crop_type": "Soybean",
        "daily_capacity_kg": 75000,
        "hourly_intake_limit": 30,
    },
    {
        "center_id": "c4444444-4444-4444-4444-444444444444",  # FAKE — offline testing only
        "center_name": "Guntur Mirchi & Cotton Yard",
        "district": "Guntur",
        "state": "Andhra Pradesh",
        "crop_type": "Cotton",
        "daily_capacity_kg": 60000,
        "hourly_intake_limit": 25,
    },
    {
        "center_id": "c5555555-5555-5555-5555-555555555555",  # FAKE — offline testing only
        "center_name": "Kota Mandi Samiti",
        "district": "Kota",
        "state": "Rajasthan",
        "crop_type": "Mustard",
        "daily_capacity_kg": 55000,
        "hourly_intake_limit": 20,
    },
]


def load_mandi_centers() -> List[Dict]:
    """
    Fetches real mandi centers from Supabase (public read, anon key is
    enough — centers_public_read policy allows this). Falls back to
    clearly-fake placeholder centers ONLY if credentials are missing or
    the request fails, so local/offline dataset generation still works —
    but a loud warning is printed so nobody mistakes fake IDs for real ones.
    """
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        print("⚠️  SUPABASE_URL / SUPABASE_ANON_KEY not set — using FAKE placeholder")
        print("    center IDs. These will NOT match your real database. Set the")
        print("    env vars before running batch_forecaster.py for real output.")
        return _PLACEHOLDER_MANDI_CENTERS

    try:
        import requests
        endpoint = f"{supabase_url.rstrip('/')}/rest/v1/mandi_centers"
        headers = {"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}"}
        params = {"select": "center_id,center_name,district,state,crop_type,daily_capacity_kg,hourly_intake_limit"}
        resp = requests.get(endpoint, headers=headers, params=params, timeout=10)
        if resp.status_code == 200 and resp.json():
            centers = resp.json()
            print(f"✅ Loaded {len(centers)} real mandi centers from Supabase.")
            return centers
        else:
            print(f"⚠️  Supabase returned no centers (status {resp.status_code}) — "
                  f"falling back to placeholder data. Has P6 seeded mandi_centers yet?")
            return _PLACEHOLDER_MANDI_CENTERS
    except Exception as e:
        print(f"⚠️  Failed to reach Supabase ({e}) — falling back to placeholder data.")
        return _PLACEHOLDER_MANDI_CENTERS


# Loaded once at import time. If you need to refresh mid-session (e.g. after
# P6 reseeds), call load_mandi_centers() again explicitly.
DEFAULT_MANDI_CENTERS = load_mandi_centers()


def generate_mandi_dataset(
    start_date: Optional[datetime.date] = None,
    days: int = 365,
    random_seed: int = 42,
    include_all_crops: bool = True,
) -> pd.DataFrame:
    """
    Generates time-series data for mandi centers and commodities.
    """
    random.seed(random_seed)
    np.random.seed(random_seed)

    if start_date is None:
        # Default starting from 1 year prior to current date
        start_date = datetime.date(2025, 9, 1)

    records = []

    # Centers to iterate through
    centers = DEFAULT_MANDI_CENTERS

    for center in centers:
        crop_name = center["crop_type"]
        profile = CROP_PROFILES.get(crop_name, CROP_PROFILES["Wheat"])

        current_price = profile["base_price"]

        for d in range(days):
            record_date = start_date + datetime.timedelta(days=d)
            month = record_date.month
            day_of_week = record_date.weekday()  # 0=Monday, 6=Sunday

            # Seasonal Multipliers
            if month in profile["peak_months"]:
                # High arrival, lower price pressure
                arrival_mult = random.uniform(1.4, 2.2)
                seasonal_price_factor = random.uniform(0.92, 0.98)
            elif month in profile["lean_months"]:
                # Low arrival, price spike
                arrival_mult = random.uniform(0.4, 0.7)
                seasonal_price_factor = random.uniform(1.05, 1.20)
            else:
                arrival_mult = random.uniform(0.85, 1.15)
                seasonal_price_factor = random.uniform(0.98, 1.03)

            # Weekend closure / Sunday slump effect
            if day_of_week == 6:  # Sunday
                arrival_tonnes = random.uniform(10.0, 30.0)
            else:
                arrival_tonnes = profile["base_arrival"] * arrival_mult * random.uniform(0.88, 1.12)

            # Random Walk + Mean Reversion + Seasonality
            mean_rev_pull = (profile["base_price"] - current_price) * 0.03
            shock = np.random.normal(0, profile["price_volatility"] * 0.4)
            drift = profile["trend_drift"] * d * 0.05

            current_price = current_price + mean_rev_pull + shock + drift
            modal_price = round(max(profile["msp"] * 0.85, current_price * seasonal_price_factor), 2)

            # Spread for min and max prices
            spread = modal_price * random.uniform(0.03, 0.08)
            min_price = round(modal_price - spread, 2)
            max_price = round(modal_price + spread, 2)

            # Fuel index and rainfall anomalies
            fuel_index = round(100.0 + (d * 0.02) + random.uniform(-1.5, 1.5), 2)
            rainfall_anomaly = round(random.uniform(-5.0, 15.0) if month in [6, 7, 8, 9] else random.uniform(-1.0, 2.0), 2)

            records.append({
                "date": record_date.strftime("%Y-%m-%d"),
                "crop_type": crop_name,
                "center_id": center["center_id"],
                "center_name": center["center_name"],
                "district": center["district"],
                "state": center["state"],
                "modal_price": modal_price,
                "min_price": min_price,
                "max_price": max_price,
                "arrival_tonnes": round(arrival_tonnes, 2),
                "day_of_week": day_of_week,
                "month": month,
                "fuel_index": fuel_index,
                "rainfall_anomaly": rainfall_anomaly,
                "msp": profile["msp"],
            })

    # If requested, generate for remaining standalone crop profiles too
    if include_all_crops:
        assigned_crops = {c["crop_type"] for c in centers}
        remaining_crops = [crop for crop in CROP_PROFILES.keys() if crop not in assigned_crops]

        for crop_name in remaining_crops:
            profile = CROP_PROFILES[crop_name]
            current_price = profile["base_price"]

            for d in range(days):
                record_date = start_date + datetime.timedelta(days=d)
                month = record_date.month
                day_of_week = record_date.weekday()

                if month in profile["peak_months"]:
                    arrival_mult = random.uniform(1.3, 2.0)
                    seasonal_price_factor = random.uniform(0.93, 0.98)
                elif month in profile["lean_months"]:
                    arrival_mult = random.uniform(0.4, 0.7)
                    seasonal_price_factor = random.uniform(1.05, 1.18)
                else:
                    arrival_mult = random.uniform(0.85, 1.15)
                    seasonal_price_factor = random.uniform(0.98, 1.03)

                arrival_tonnes = (
                    random.uniform(10.0, 25.0) if day_of_week == 6
                    else profile["base_arrival"] * arrival_mult * random.uniform(0.88, 1.12)
                )

                mean_rev_pull = (profile["base_price"] - current_price) * 0.03
                shock = np.random.normal(0, profile["price_volatility"] * 0.4)
                drift = profile["trend_drift"] * d * 0.05

                current_price = current_price + mean_rev_pull + shock + drift
                modal_price = round(max(profile["msp"] * 0.85, current_price * seasonal_price_factor), 2)

                spread = modal_price * random.uniform(0.03, 0.07)
                min_price = round(modal_price - spread, 2)
                max_price = round(modal_price + spread, 2)

                fuel_index = round(100.0 + (d * 0.02) + random.uniform(-1.5, 1.5), 2)
                rainfall_anomaly = round(random.uniform(-5.0, 15.0) if month in [6, 7, 8, 9] else 0.0, 2)

                records.append({
                    "date": record_date.strftime("%Y-%m-%d"),
                    "crop_type": crop_name,
                    "center_id": f"gen-{crop_name.lower()}-center-001",
                    "center_name": f"Regional {crop_name} Mandi",
                    "district": "Central",
                    "state": "National",
                    "modal_price": modal_price,
                    "min_price": min_price,
                    "max_price": max_price,
                    "arrival_tonnes": round(arrival_tonnes, 2),
                    "day_of_week": day_of_week,
                    "month": month,
                    "fuel_index": fuel_index,
                    "rainfall_anomaly": rainfall_anomaly,
                    "msp": profile["msp"],
                })

    df = pd.DataFrame(records)
    return df


if __name__ == "__main__":
    df = generate_mandi_dataset(days=365)
    print(f"Generated {len(df)} synthetic mandi market records across {df['crop_type'].nunique()} crops.")
    print("Sample records:")
    print(df[["date", "crop_type", "center_name", "modal_price", "arrival_tonnes"]].head(10))
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "synthetic_mandi_data.csv")
    df.to_csv(output_path, index=False)
    print(f"Saved to {output_path}")