"""
AgriQ - P5 Predictive Engine
Module: dispatch_scorer.py
Description: Computes initial baseline Dispatch Scores & generates canonical reason text.
Canonical format & thresholds strictly align with PostgreSQL generate_smart_reason_text().
"""

from typing import Dict, List, Optional


def calculate_smart_dispatch_score(
    price_trend_score: float,
    load_ratio: float,
    penalty_weight: float = 25.0
) -> float:
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
    Canonical reason text generator.
    Thresholds strictly align with traffic light bands:
      >= 70.0: GREEN  -> ⭐ Recommended
      >= 45.0: YELLOW -> ✓ Moderate / Fair
      < 45.0:  RED    -> ⚠️ Avoid / Busy
    """
    # 1. Badge
    if best_day_score >= 70.0:
        badge = "⭐ Recommended: "
        badge_hi = "⭐ सर्वोत्तम दिन: "
    elif best_day_score >= 45.0:
        badge = "✓ Moderate / Fair: "
        badge_hi = "✓ उपयुक्त दिन: "
    else:
        badge = "⚠️ Avoid / Busy: "
        badge_hi = "⚠️ सलाह (व्यस्त/भाव धीमा): "

    # 2. Price Trend component
    if price_pct_change >= 4.0:
        price_desc = f"📈 Price surging (+{price_pct_change:.1f}%, est. ₹{predicted_price:,.0f}/qtl)"
        price_hi = f"मंडी भाव में तेजी (+{price_pct_change:.1f}%, अनुमानित ₹{predicted_price:,.0f})"
    elif price_pct_change >= 1.0:
        price_desc = f"↗️ Favorable price (est. ₹{predicted_price:,.0f}/qtl)"
        price_hi = f"उचित भाव (अनुमानित ₹{predicted_price:,.0f})"
    elif price_pct_change > -2.0:
        price_desc = f"➡️ Stable rate (est. ₹{predicted_price:,.0f}/qtl)"
        price_hi = f"स्थिर भाव (अनुमानित ₹{predicted_price:,.0f})"
    else:
        price_desc = f"📉 Softening prices ({price_pct_change:.1f}%, est. ₹{predicted_price:,.0f}/qtl)"
        price_hi = f"भाव में नरमी ({price_pct_change:.1f}%, अनुमानित ₹{predicted_price:,.0f})"

    # 3. Crowd / Congestion component
    load_pct = int(load_ratio * 100)
    if load_ratio <= 0.30:
        crowd_desc = f"🟢 Low crowd ({load_pct}% booked, minimal wait)"
        crowd_hi = f"कम भीड़ ({load_pct}% स्लॉट, त्वरित तौल)"
    elif load_ratio <= 0.65:
        crowd_desc = f"🟡 Normal rush ({load_pct}% booked)"
        crowd_hi = f"सामान्य भीड़ ({load_pct}% स्लॉट)"
    elif load_ratio <= 0.85:
        crowd_desc = f"🟠 Heavy booking ({load_pct}% filled, wait ~45-60m)"
        crowd_hi = f"अधिक बुकिंग ({load_pct}% स्लॉट, ~45-60 मिनट प्रतीक्षा)"
    else:
        crowd_desc = f"🔴 High congestion ({load_pct}% capacity booked)"
        crowd_hi = f"अत्यधिक भीड़ ({load_pct}% स्लॉट)"

    if lang == "hi":
        return f"{badge_hi}{price_hi} • {crowd_hi}"
    return f"{badge}{price_desc} • {crowd_desc}"


def score_and_rank_forecasts(
    forecast_records: List[Dict],
    center_loads: Optional[Dict[str, float]] = None,
    penalty_weight: float = 25.0,
    crop_type: str = "Wheat"
) -> List[Dict]:
    if center_loads is None:
        center_loads = {}

    ranked = []
    for item in forecast_records:
        date_str = item["forecast_date"]
        load_ratio = float(center_loads.get(date_str, 0.0))
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

        # Traffic light alignment
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

    ranked.sort(key=lambda x: x["best_day_score"], reverse=True)
    for i, r in enumerate(ranked):
        r["rank"] = i + 1
        r["is_best_day"] = (i == 0)

    return sorted(ranked, key=lambda x: x["forecast_date"])
