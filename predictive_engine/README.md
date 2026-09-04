# AgriQ — P5 Predictive Engine & Smart Dispatch System

**Role**: P5 (Predictive Engine Lead)  
**SIH 2026 — PS 26032** | Runtime-Terror  
**Core Mission**: Forecast APMC commodity price trends, compute baseline scores, and supply PostgreSQL RPCs so the Farmer App (P2) and USSD Gateway (P4) get instant, cold-start-proof "Best Day to Sell" recommendations.

---

## 🏛️ Architectural Rule: Supabase is Single Source of Truth

```
+-------------------------------------------------------------------------+
|                         P5 BATCH PIPELINE                               |
|                                                                         |
| 1. Historical Dataset Generator (365 days, 10 crops, 5 Mandi Centers)  |
| 2. Scikit-Learn Time Series Regression (HistGradientBoosting / Ridge)   |
| 3. Multi-Step 7-30 Day Autoregressive Price Trajectory Forecast         |
| 4. Emits: price_trend_score in [0, 100] + seed_daily_rates_cache.sql    |
+------------------------------------+------------------------------------+
                                     |
                                     v Writes batch price trends
+-------------------------------------------------------------------------+
|                  SUPABASE POSTGRESQL (Single Source of Truth)           |
|                                                                         |
|  daily_rates_cache Table:                                               |
|    - crop_type, center_id, forecast_date                                |
|    - price_trend_score, best_day_score, reason_text                     |
|                                                                         |
|  daily_booking_load VIEW:                                               |
|    - center_id, slot_date, bookings_count, load_ratio                   |
|                                                                         |
|  PostgreSQL RPC: get_best_selling_days() (OWNS LIVE RE-SCORING)          |
|    Formula: adjusted_score = price_score - (load_ratio * penalty_weight)|
|    Generates: synchronized canonical reason_text matching live score    |
+-------------------+--------------------------------+--------------------+
                    |                                |
                    v                                v
+----------------------------+      +-------------------------------------+
| P2: Farmer Web / PWA       |      | P4: USSD Gateway (*99#)             |
| Calls: RPC                 |      | Reads: daily_rates_cache            |
| get_best_selling_days()    |      | (Option 3: Mandi Rates)             |
+----------------------------+      +-------------------------------------+
```

---

## ⚠️ Critical Integration Notice for Teammates

1. **P2 (Farmer App)**:
   - **DO NOT** call FastAPI for rates or best-day recommendations.
   - **DO** call the Supabase RPC `get_best_selling_days`:
     ```typescript
     const { data, error } = await supabase.rpc('get_best_selling_days', {
       p_crop_type: 'Wheat',
       p_center_id: selectedCenterId,
       p_days_ahead: 7
     });
     // Returns: forecast_date, day_name ('Mon'), price_trend_score, load_ratio,
     //          best_day_score, traffic_light ('GREEN'|'YELLOW'|'RED'), reason_text, is_best_day
     ```

2. **P4 (USSD Gateway)**:
   - For `3. Mandi Rates`, query Supabase `daily_rates_cache` directly:
     ```typescript
     const { data, error } = await supabase
       .from('daily_rates_cache')
       .select('crop_type, price_trend_score, best_day_score, reason_text')
       .eq('center_id', selectedCenterId)
       .eq('forecast_date', todayDate)
       .single();
     ```

3. **FastAPI Microservice (`app.py`)**:
   - Strictly scoped as a **Q&A stretch goal** (`/api/qa` and `/health`).
   - Uses portable relative path resolution (`Path(__file__).parent.parent / "daily_rates_cache.json"`) so it runs seamlessly on any machine or cloud container without hardcoded absolute paths.

---

## 🧮 Smart Dispatch Scoring & Threshold Alignment

$$\text{Adjusted Score} = \text{Price Trend Score} - \left(\frac{\text{Bookings on Day}}{\text{Center Daily Capacity}}\right) \times \text{Penalty Weight}$$

### Synchronized Threshold Bands:
| Score Range | Traffic Light | Badge & Reason Text |
|---|---|---|
| $\ge 70.0$ | `GREEN` | `⭐ Recommended: ` + Price Trend + Crowd Status |
| $45.0 \le \text{Score} < 70.0$ | `YELLOW` | `✓ Moderate / Fair: ` + Price Trend + Crowd Status |
| $< 45.0$ | `RED` | `⚠️ Avoid / Busy: ` + Price Trend + Crowd Status |

Both Python (`dispatch_scorer.py`) and PostgreSQL (`generate_smart_reason_text()`) implement this exact canonical text format and threshold logic.

---

## 📁 Directory Structure

```
predictive_engine/
├── generate_dataset.py       # Generates 365+ days synthetic APMC market data
├── model.py                  # Scikit-Learn regression & multi-step forecasting
├── dispatch_scorer.py        # Smart dispatch formula & canonical reason text
├── batch_forecaster.py       # End-to-end batch script (trains, forecasts, exports)
├── cli.py                    # Interactive demo CLI with what-if congestion simulation
├── requirements.txt          # Python dependencies
├── test_predictive_engine.py # Pytest test suite (6/6 passing)
├── saved_models/             # Serialized .joblib model artifacts
├── daily_rates_cache.json    # JSON dump for reference/mocking
└── api/
    ├── app.py                # FastAPI microservice (strictly scoped to /api/qa)
    └── qa_engine.py          # Rule-based NLP Q&A engine for farmer queries
```

---

## 🚀 How to Run

### 1. Run Batch Forecast Pipeline (Generates SQL Seed & JSON Dump)
```bash
PYTHONPATH=. python3 -m predictive_engine.batch_forecaster --days 14
```

### 2. Run What-If Demo Simulation
```bash
PYTHONPATH=. python3 -m predictive_engine.cli --simulate --crop Wheat
```

### 3. Run Test Suite
```bash
PYTHONPATH=. pytest predictive_engine/test_predictive_engine.py -v
```

### 4. Run Q&A Microservice (Stretch Goal)
```bash
PYTHONPATH=. uvicorn predictive_engine.api.app:app --host 0.0.0.0 --port 8000 --reload
```
