"""
AgriQ - P5 Predictive Engine
Module: model.py
Description: Feature engineering and Machine Learning price forecasting model
using Scikit-Learn (HistGradientBoosting / RandomForest / Ridge) for APMC mandi commodities.
"""

import os
import math
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import RidgeCV
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error


class MandiPriceForecaster:
    """
    ML model for forecasting commodity price trends in APMC mandis.
    """

    def __init__(self, crop_type: str, model_type: str = "hist_gb"):
        self.crop_type = crop_type
        self.model_type = model_type
        self.feature_names: List[str] = []
        self.model = None
        self.last_known_data: Optional[pd.DataFrame] = None
        self.is_trained = False
        self.metrics: Dict[str, float] = {}

    def extract_features(self, df: pd.DataFrame, is_training: bool = True) -> pd.DataFrame:
        """
        Engineers temporal, statistical, and momentum features from price/arrival time series.
        """
        data = df.copy()
        data["date"] = pd.to_datetime(data["date"])
        data = data.sort_values("date").reset_index(drop=True)

        # 1. Temporal & Cyclical Features
        data["day_of_week"] = data["date"].dt.dayofweek
        data["day_of_month"] = data["date"].dt.day
        data["month"] = data["date"].dt.month
        data["day_of_year"] = data["date"].dt.dayofyear

        # Seasonal Sine/Cosine components (365-day annual wave)
        data["season_sin"] = np.sin(2 * np.pi * data["day_of_year"] / 365.25)
        data["season_cos"] = np.cos(2 * np.pi * data["day_of_year"] / 365.25)

        # 2. Lagged Price Features
        for lag in [1, 2, 3, 7, 14, 21]:
            data[f"price_lag_{lag}"] = data["modal_price"].shift(lag)

        # 3. Rolling Window Statistics
        data["price_rolling_mean_7"] = data["modal_price"].shift(1).rolling(window=7, min_periods=1).mean()
        data["price_rolling_std_7"] = data["modal_price"].shift(1).rolling(window=7, min_periods=1).std().fillna(0)
        data["price_rolling_mean_14"] = data["modal_price"].shift(1).rolling(window=14, min_periods=1).mean()
        data["price_rolling_mean_30"] = data["modal_price"].shift(1).rolling(window=30, min_periods=1).mean()

        # 4. Momentum & Velocity
        data["momentum_7"] = data["modal_price"].shift(1) - data["modal_price"].shift(7)
        data["momentum_14"] = data["modal_price"].shift(1) - data["modal_price"].shift(14)
        data["price_spread"] = data["max_price"] - data["min_price"]

        # 5. Arrival Volume Lags & Moving Averages
        if "arrival_tonnes" in data.columns:
            data["arrival_lag_1"] = data["arrival_tonnes"].shift(1)
            data["arrival_lag_7"] = data["arrival_tonnes"].shift(7)
            data["arrival_rolling_mean_7"] = data["arrival_tonnes"].shift(1).rolling(window=7, min_periods=1).mean()
        else:
            data["arrival_lag_1"] = 0
            data["arrival_lag_7"] = 0
            data["arrival_rolling_mean_7"] = 0

        # External Indicators
        if "fuel_index" not in data.columns:
            data["fuel_index"] = 100.0
        if "rainfall_anomaly" not in data.columns:
            data["rainfall_anomaly"] = 0.0

        if is_training:
            # Drop rows with NaN caused by shifting
            data = data.dropna().reset_index(drop=True)

        return data

    def train(self, historical_df: pd.DataFrame) -> Dict[str, float]:
        """
        Trains the forecasting model on historical commodity data.
        """
        crop_data = historical_df[historical_df["crop_type"].str.lower() == self.crop_type.lower()].copy()
        if len(crop_data) < 30:
            raise ValueError(f"Insufficient training records ({len(crop_data)}) for crop '{self.crop_type}'. Minimum 30 required.")

        processed = self.extract_features(crop_data, is_training=True)

        feature_cols = [
            "day_of_week", "day_of_month", "month", "season_sin", "season_cos",
            "price_lag_1", "price_lag_2", "price_lag_3", "price_lag_7", "price_lag_14", "price_lag_21",
            "price_rolling_mean_7", "price_rolling_std_7", "price_rolling_mean_14", "price_rolling_mean_30",
            "momentum_7", "momentum_14",
            "arrival_lag_1", "arrival_lag_7", "arrival_rolling_mean_7",
            "fuel_index", "rainfall_anomaly"
        ]

        self.feature_names = feature_cols
        X = processed[feature_cols]
        y = processed["modal_price"]

        # Train/Test Split (Time-based split: last 20% for testing)
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

        if self.model_type == "hist_gb":
            self.model = HistGradientBoostingRegressor(
                max_iter=150,
                learning_rate=0.08,
                max_leaf_nodes=31,
                min_samples_leaf=5,
                random_state=42
            )
        elif self.model_type == "rf":
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=12,
                min_samples_split=4,
                random_state=42
            )
        else:
            self.model = RidgeCV(alphas=np.logspace(-3, 3, 10))

        self.model.fit(X_train, y_train)

        # Evaluate performance
        y_pred = self.model.predict(X_test)
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))
        mae = float(mean_absolute_error(y_test, y_pred))

        # Re-train on full dataset for live forecasting
        self.model.fit(X, y)
        self.last_known_data = processed.tail(45).copy()
        self.is_trained = True

        self.metrics = {
            "rmse": round(rmse, 2),
            "r2": round(r2, 4),
            "mae": round(mae, 2),
            "samples": len(processed),
        }
        return self.metrics

    def forecast_trajectory(
        self,
        days_ahead: int = 14,
        recent_history: Optional[pd.DataFrame] = None
    ) -> List[Dict]:
        """
        Produces multi-step autoregressive forecasts for the next N days.
        Returns daily predictions, price trend scores [0-100], and trajectories.
        """
        if not self.is_trained:
            raise RuntimeError("Model is not trained yet. Call train() first.")

        if recent_history is not None:
            hist = self.extract_features(recent_history, is_training=False).tail(45).copy()
        else:
            hist = self.last_known_data.copy()

        predictions = []
        last_date = pd.to_datetime(hist["date"].iloc[-1])
        working_hist = hist.copy()

        current_base_price = float(working_hist["modal_price"].iloc[-1])

        for step in range(1, days_ahead + 1):
            next_date = last_date + pd.Timedelta(days=step)
            day_of_week = next_date.dayofweek
            day_of_month = next_date.day
            month = next_date.month
            day_of_year = next_date.dayofyear

            season_sin = np.sin(2 * np.pi * day_of_year / 365.25)
            season_cos = np.cos(2 * np.pi * day_of_year / 365.25)

            # Extract lag values from working history
            p_lag_1 = float(working_hist["modal_price"].iloc[-1])
            p_lag_2 = float(working_hist["modal_price"].iloc[-2]) if len(working_hist) >= 2 else p_lag_1
            p_lag_3 = float(working_hist["modal_price"].iloc[-3]) if len(working_hist) >= 3 else p_lag_2
            p_lag_7 = float(working_hist["modal_price"].iloc[-7]) if len(working_hist) >= 7 else p_lag_1
            p_lag_14 = float(working_hist["modal_price"].iloc[-14]) if len(working_hist) >= 14 else p_lag_7
            p_lag_21 = float(working_hist["modal_price"].iloc[-21]) if len(working_hist) >= 21 else p_lag_14

            price_roll_7 = float(working_hist["modal_price"].tail(7).mean())
            price_roll_std_7 = float(working_hist["modal_price"].tail(7).std()) if len(working_hist) >= 7 else 0.0
            price_roll_14 = float(working_hist["modal_price"].tail(14).mean())
            price_roll_30 = float(working_hist["modal_price"].tail(30).mean())

            momentum_7 = p_lag_1 - p_lag_7
            momentum_14 = p_lag_1 - p_lag_14

            arr_lag_1 = float(working_hist["arrival_tonnes"].iloc[-1]) if "arrival_tonnes" in working_hist.columns else 200.0
            arr_lag_7 = float(working_hist["arrival_tonnes"].iloc[-7]) if len(working_hist) >= 7 and "arrival_tonnes" in working_hist.columns else arr_lag_1
            arr_roll_7 = float(working_hist["arrival_tonnes"].tail(7).mean()) if "arrival_tonnes" in working_hist.columns else 200.0

            fuel_index = float(working_hist["fuel_index"].iloc[-1]) if "fuel_index" in working_hist.columns else 100.0
            rainfall_anomaly = 0.0

            row_features = pd.DataFrame([{
                "day_of_week": day_of_week,
                "day_of_month": day_of_month,
                "month": month,
                "season_sin": season_sin,
                "season_cos": season_cos,
                "price_lag_1": p_lag_1,
                "price_lag_2": p_lag_2,
                "price_lag_3": p_lag_3,
                "price_lag_7": p_lag_7,
                "price_lag_14": p_lag_14,
                "price_lag_21": p_lag_21,
                "price_rolling_mean_7": price_roll_7,
                "price_rolling_std_7": price_roll_std_7 if not math.isnan(price_roll_std_7) else 0.0,
                "price_rolling_mean_14": price_roll_14,
                "price_rolling_mean_30": price_roll_30,
                "momentum_7": momentum_7,
                "momentum_14": momentum_14,
                "arrival_lag_1": arr_lag_1,
                "arrival_lag_7": arr_lag_7,
                "arrival_rolling_mean_7": arr_roll_7,
                "fuel_index": fuel_index,
                "rainfall_anomaly": rainfall_anomaly
            }])[self.feature_names]

            pred_price = float(self.model.predict(row_features)[0])
            pred_price = round(max(500.0, pred_price), 2)

            # Append synthetic row to working history for multi-step autoregression
            new_row = {
                "date": next_date.strftime("%Y-%m-%d"),
                "crop_type": self.crop_type,
                "modal_price": pred_price,
                "min_price": round(pred_price * 0.95, 2),
                "max_price": round(pred_price * 1.05, 2),
                "arrival_tonnes": arr_roll_7,
                "fuel_index": fuel_index,
                "rainfall_anomaly": 0.0
            }
            working_hist = pd.concat([working_hist, pd.DataFrame([new_row])], ignore_index=True)

            # Price trend delta from current baseline
            price_delta = pred_price - current_base_price
            price_pct_change = (price_delta / current_base_price) * 100.0

            # Compute normalized price_trend_score [0 to 100]
            # Baseline = 50. A +5% price increase maps to ~75, +10% to ~90. -5% to ~25.
            # Sigmoidal mapping centered at 50:
            price_trend_score = 50.0 + (50.0 * np.tanh(price_pct_change / 6.0))
            price_trend_score = round(max(5.0, min(95.0, float(price_trend_score))), 1)

            predictions.append({
                "forecast_date": next_date.strftime("%Y-%m-%d"),
                "step_day": step,
                "day_name": next_date.strftime("%A"),
                "predicted_price": pred_price,
                "current_price": current_base_price,
                "price_delta": round(price_delta, 2),
                "price_pct_change": round(price_pct_change, 2),
                "price_trend_score": price_trend_score,
            })

        return predictions

    def save(self, filepath: str) -> None:
        """Saves trained model artifact."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self, filepath)

    @classmethod
    def load(cls, filepath: str) -> "MandiPriceForecaster":
        """Loads trained model artifact."""
        return joblib.load(filepath)
