# AgriQ — P5 Predictive Engine & Smart Dispatch System

**Role**: P5 (Predictive Engine Lead)  
**SIH 2026 — PS 26032** | Runtime-Terror  
**Core Mission**: Forecast APMC commodity price trends, factor in live mandi booking load to penalize congestion, and populate `daily_rates_cache` + PostgreSQL functions so the Farmer App (P2) and USSD Gateway (P4) get instant, cold-start-proof "Best Day to Sell" recommendations.

---

## 🏗️ Architecture & Data Flow

```
+-------------------------------------------------------------------------+
|                         P5 BATCH PIPELINE                               |
|                                                                         |
| 1. Historical Dataset Generator (365 days, 10 crops, 5 Mandi Centers)  |
| 2. Scikit-Learn Time Series Regression (HistGradientBoosting / Ridge)   |
| 3. Multi-Step 7-30 Day Autoregressive Price Trajectory Forecast         |
| 4. Price Trend Normalization: price_trend_score in [0, 100]             |
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
|  PostgreSQL RPC: get_best_selling_days()                                |
|    Formula: adjusted_score = price_score - (load_ratio * penalty_weight)|
+-------------------+--------------------------------+--------------------+
                    |                                |
                    v                                v
+----------------------------+      +-------------------------------------+
| P2: Farmer Web / PWA       |      | P4: USSD Gateway (*99#)             |
| "Best Day to Sell" Widget  |      | Option 3: Mandi Rates               |
+----------------------------+      +-------------------------------------+
```

---

## 🧮 Smart Dispatch Scoring Formula

$$\text{Adjusted Score} = \text{Price Trend Score} - \left(\frac{\text{Bookings on Day}}{\text{Center Daily Capacity}}\right) \times \text{Penalty Weight}$$

### Why this matters:
- **Price Trend Score $\in [0, 100]$**: Forecasted price rise increases score (up to 95); falling price decreases score (down to 10).
- **Load Penalty**: If Mandi Center is already at 80% capacity on Day X, load penalty $= 0.8 \times 25 = 20$ points.
- **Smart Steering**: A day with slightly lower price trend (+3%) and low crowd (10% load) outscores a day with higher price (+5%) but 90% congestion. This automatically steers farmers away from crowded days without server delays!

---

## 📁 Directory Structure

```
predictive_engine/
├── generate_dataset.py       # Generates 365+ days synthetic APMC market data
├── model.py                  # Scikit-Learn regression & multi-step forecasting
├── dispatch_scorer.py        # Smart dispatch formula & bilingual reason text
├── batch_forecaster.py       # End-to-end batch script (trains, forecasts, exports)
├── requirements.txt          # Python dependencies
├── test_predictive_engine.py # Pytest test suite (6 tests covering all modules)
├── saved_models/             # Serialized .joblib model artifacts
├── daily_rates_cache.json    # JSON dump for frontend & USSD mocks
└── api/
    ├── app.py                # FastAPI microservice (stretch goal)
    └── qa_engine.py          # Rule-based NLP Q&A engine for farmer queries
```

---

## 🚀 How to Run

### 1. Run the Batch Pipeline (Generate forecasts & SQL seed)
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r predictive_engine/requirements.txt

# Run 14-day forecast across all mandis & export SQL seed
PYTHONPATH=. python3 -m predictive_engine.batch_forecaster --days 14
```
This generates:
- `sql/seed_daily_rates_cache.sql`: Ready to paste into Supabase SQL Editor.
- `predictive_engine/daily_rates_cache.json`: Ready for frontend mocks.

### 2. Run the Test Suite
```bash
PYTHONPATH=. pytest predictive_engine/test_predictive_engine.py -v
```

### 3. Run FastAPI Microservice (Optional Stretch Goal)
```bash
PYTHONPATH=. uvicorn predictive_engine.api.app:app --host 0.0.0.0 --port 8000 --reload
```
Endpoints:
- `GET http://localhost:8000/health`
- `GET http://localhost:8000/api/rates?crop_type=Wheat`
- `GET http://localhost:8000/api/best-day?crop_type=Wheat`
- `POST http://localhost:8000/api/qa` with `{"query": "When should I sell wheat?", "lang": "hi"}`

---

## 🤝 Integration Contracts for Teammates

### For P2 (Farmer App):
To display the **"Best Day to Sell"** card, call the Postgres RPC:
```typescript
const { data, error } = await supabase.rpc('get_best_selling_days', {
  p_crop_type: 'Wheat',
  p_center_id: selectedCenterId,
  p_days_ahead: 7
});
// Returns array of days with:
// { forecast_date, day_name, price_trend_score, load_ratio, best_day_score, traffic_light ('GREEN'|'YELLOW'|'RED'), reason_text, is_best_day }
```

### For P4 (USSD Gateway):
For the `3. Mandi Rates` menu, query `daily_rates_cache`:
```typescript
const { data, error } = await supabase
  .from('daily_rates_cache')
  .select('crop_type, price_trend_score, best_day_score, reason_text')
  .eq('center_id', selectedCenterId)
  .eq('forecast_date', todayDate)
  .single();
```

### For P6 (Integration Lead):
- Schema functions are located in `sql/p5_predictive_functions.sql`.
- Pre-computed seed records are in `sql/seed_daily_rates_cache.sql`.
