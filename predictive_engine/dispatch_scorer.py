"""
AgriQ - P5 Predictive Engine
Module: dispatch_scorer.py
Description: Computes Smart Dispatch Scores and generates human-readable reasoning
by fusing ML Price Trend Forecasts with Live Mandi Booking Load Congestion.
"""

from typing import Dict, List, Optional
import datetime


def calculate_smart_dispatch_score(
    price_trend_score: float,
    load_ratio: float,
    penalty_weight: float = 25.0
) -> float:
    """
    Core Smart Dispatch Scoring Formula:
    adjusted_score = price_trend_score - (load_ratio * penalty_weight)

    - price_trend_score: [0 - 100] from ML price regression
    - load_ratio: [0.0 - 1.0+] (bookings_on_day / capacity) from daily_booking_load view
    - penalty_weight: Default 25.0 (can scale up during harvest peaks)
    """
    penalty = min(50.0, max(0.0, load_ratio * penalty_weight))
    adjusted_score = price_trend_score - penalty
    return round(max(5.0, min(100.0, adjusted_score)), 1)


def generate_reason_text(
    crop_type: str,
    forecast_date: str,
    price_pct_change: float,
    predicted_price: float,
    load_ratio: float,
    best_day_score: float,
    lang: str = "en"
) -> str:
    """
    Generates concise, informative reason text suitable for Farmer App UI (P2)
    and USSD feature phone menu display (P4).
    """
    # 1. Price Trend Narrative
    if price_pct_change >= 4.0:
        price_desc = f"📈 Price surging (+{price_pct_change:.1f}%, est. ₹{predicted_price:,.0f}/qtl)"
        price_hi = f"मंडी भाव में तेजी (+{price_pct_change:.1f}%, अनुमानित ₹{predicted_price:,.0f})"
    elif price_pct_change >= 1.0:
        price_desc = f"↗️ Favorable price (est. ₹{predicted_price:,.0f}/qtl)"
        price_hi = f"उचित भाव (अनुमानित ₹{predicted_price:,.0f})"
    elif price_pct_change > -2.0:
        price_desc = f"➡️ Stable price (est. ₹{predicted_price:,.0f}/qtl)"
        price_hi = f"स्थिर भाव (अनुमानित ₹{predicted_price:,.0f})"
    else:
        price_desc = f"📉 Declining trend ({price_pct_change:.1f}%, est. ₹{predicted_price:,.0f}/qtl)"
        price_hi = f"भाव में गिरावट ({price_pct_change:.1f}%, अनुमानित ₹{predicted_price:,.0f})"

    # 2. Mandi Load & Queue Congestion Narrative
    load_pct = int(load_ratio * 100)
    if load_ratio <= 0.30:
        crowd_desc = f"🟢 Low crowd ({load_pct}% booked, minimal wait)"
        crowd_hi = f"कम भीड़ ({load_pct}% स्लॉट, त्वरित तौल)"
    elif load_ratio <= 0.65:
        crowd_desc = f"🟡 Moderate crowd ({load_pct}% booked, normal turnaround)"
        crowd_hi = f"मध्यम भीड़ ({load_pct}% स्लॉट)"
    elif load_ratio <= 0.85:
        crowd_desc = f"🟠 Heavy booking ({load_pct}% filled, expected wait ~45-60m)"
        crowd_hi = f"अधिक बुकिंग ({load_pct}% स्लॉट, ~45-60 मिनट प्रतीक्षा)"
    else:
        crowd_desc = f"🔴 Severe congestion ({load_pct}% booked, bottleneck alert)"
        crowd_hi = f"अत्यधिक भीड़ ({load_pct}% स्लॉट, भारी प्रतीक्षा)"

    # 3. Overall Recommendation Tag
    if best_day_score >= 75.0:
        badge = "⭐ Highly Recommended: "
        badge_hi = "⭐ सर्वोत्तम दिन: "
    elif best_day_score >= 50.0:
        badge = "✓ Good Day to Sell: "
        badge_hi = "✓ उपयुक्त दिन: "
    else:
        badge = "⚠️ Avoid/Delay: "
        badge_hi = "⚠️ सलाह: "

    if lang == "hi":
        return f"{badge_hi}{price_hi} • {crowd_hi}"
    return f"{badge}{price_desc} • {crowd_desc}"


def score_and_rank_forecasts(
    forecast_records: List[Dict],
    center_loads: Optional[Dict[str, float]] = None,
    penalty_weight: float = 25.0,
    crop_type: str = "Wheat"
) -> List[Dict]:
    """
    Ranks forecasted days for a crop/center and attaches full dispatch metrics.
    """
    if center_loads is None:
        center_loads = {}

    ranked = []
    for item in forecast_records:
        date_str = item["forecast_date"]
        # Look up simulated or real load ratio from daily_booking_load view
        load_ratio = float(center_loads.get(date_str, 0.20))
        price_trend_score = float(item["price_trend_score"])
        predicted_price = float(item["predicted_price"])
        price_pct_change = float(item["price_pct_change"])

        best_day_score = calculate_smart_dispatch_score(
            price_trend_score=price_trend_score,
            load_ratio=load_ratio,
            penalty_weight=penalty_weight
        )

        reason_text_en = generate_reason_text(
            crop_type=crop_type,
            forecast_date=date_str,
            price_pct_change=price_pct_change,
            predicted_price=predicted_price,
            load_ratio=load_ratio,
            best_day_score=best_day_score,
            lang="en"
        )

        reason_text_hi = generate_reason_text(
            crop_type=crop_type,
            forecast_date=date_str,
            price_pct_change=price_pct_change,
            predicted_price=predicted_price,
            load_ratio=load_ratio,
            best_day_score=best_day_score,
            lang="hi"
        )

        # Traffic light category
        if best_day_score >= 70.0:
            traffic_light = "GREEN"
        elif best_day_score >= 45.0:
            traffic_light = "YELLOW"
        else:
            traffic_light = "RED"

        ranked.append({
            **item,
            "load_ratio": round(load_ratio, 2),
            "best_day_score": best_day_score,
            "reason_text": reason_text_en,
            "reason_text_hi": reason_text_hi,
            "traffic_light": traffic_light,
        })

    # Sort descending by best_day_score
    ranked.sort(key=lambda x: x["best_day_score"], reverse=True)

    # Mark rank index
    for i, r in enumerate(ranked):
        r["rank"] = i + 1
        r["is_best_day"] = (i == 0)

    # Re-sort chronologically for calendar presentation while keeping rank metadata
    calendar_order = sorted(ranked, key=lambda x: x["forecast_date"])
    return calendar_order