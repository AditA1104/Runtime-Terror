"""
AgriQ - P5 Predictive Engine
Module: qa_engine.py
Description: Rule-based & intent-matching Q&A engine for farmers, web UI, and USSD.
Handles crop price inquiries, optimal sell timing, and mandi crowd status.
"""

import re
import datetime
from typing import Dict, Any, List, Optional
from predictive_engine.generate_dataset import CROP_PROFILES, DEFAULT_MANDI_CENTERS


class AgriQChatbotEngine:
    """
    NLP Intent Classifier & Response Generator for Mandi Queries.
    """

    CROP_SYNONYMS = {
        "wheat": ["wheat", "gehun", "gehu", "kanak"],
        "paddy": ["paddy", "rice", "dhan", "chawal"],
        "mustard": ["mustard", "sarson", "rai", "toria"],
        "cotton": ["cotton", "kapas", "rui"],
        "chana": ["chana", "gram", "chickpea", "chane"],
        "soybean": ["soybean", "soya", "soyabean"],
        "maize": ["maize", "corn", "makka", "makki"],
        "onion": ["onion", "pyaz", "pyaaz", "kanda"],
        "potato": ["potato", "aloo", "alu", "batata"],
        "tomato": ["tomato", "tamatar"],
    }

    def __init__(self, cache_records: Optional[List[Dict]] = None):
        self.cache_records = cache_records or []

    def set_cache_records(self, records: List[Dict]) -> None:
        self.cache_records = records

    def detect_crop(self, text: str) -> Optional[str]:
        text_lower = text.lower()
        for standard_crop, synonyms in self.CROP_SYNONYMS.items():
            for syn in synonyms:
                if re.search(r"\b" + re.escape(syn) + r"\b", text_lower):
                    # Return capitalized standard name
                    return standard_crop.capitalize()
        return None

    def detect_center(self, text: str) -> Optional[Dict]:
        text_lower = text.lower()
        for center in DEFAULT_MANDI_CENTERS:
            district = center["district"].lower()
            name = center["center_name"].lower()
            if district in text_lower or name in text_lower:
                return center
        return None

    def process_query(self, query: str, lang: str = "en") -> Dict[str, Any]:
        """
        Processes a farmer's natural language question and returns structured advice.
        """
        q = query.lower().strip()
        crop = self.detect_crop(q) or "Wheat"
        center = self.detect_center(q)

        # 1. Best Day / Timing Intent
        if any(w in q for w in ["when", "best day", "best time", "sell", "kab beche", "kab bechu", "right time", "recommend"]):
            return self._handle_best_day_intent(crop, center, lang)

        # 2. Price / Rate Inquiry Intent
        if any(w in q for w in ["rate", "price", "bhav", "cost", "msp", "dam", "current price", "today"]):
            return self._handle_price_intent(crop, center, lang)

        # 3. Crowd / Queue / Wait Time Intent
        if any(w in q for w in ["crowd", "rush", "queue", "wait", "bhid", "traffic", "busy", "delay"]):
            return self._handle_crowd_intent(crop, center, lang)

        # 4. Fallback General Advice
        return self._handle_fallback_intent(crop, center, lang)

    def _handle_best_day_intent(self, crop: str, center: Optional[Dict], lang: str) -> Dict[str, Any]:
        relevant = [
            r for r in self.cache_records
            if r["crop_type"].lower() == crop.lower()
            and (center is None or r["center_id"] == center["center_id"])
        ]

        if not relevant:
            return {
                "intent": "BEST_DAY_ADVICE",
                "crop": crop,
                "answer": f"For {crop}, early weekday slots (Tuesday/Wednesday) are generally recommended to avoid peak Monday mandi rush.",
                "answer_hi": f"{crop} के लिए मंगलवार या बुधवार के स्लॉट चुनें ताकि मंडी की भीड़ से बचा जा सके।",
                "recommendation": None
            }

        # Find day with highest best_day_score
        best_entry = max(relevant, key=lambda x: x["best_day_score"])
        f_date = best_entry["forecast_date"]
        score = best_entry["best_day_score"]
        price = best_entry["predicted_price"]
        reason = best_entry["reason_text"]

        if lang == "hi":
            answer = (
                f"🌾 **{crop} बेचने का सर्वोत्तम दिन {f_date} है!**\n"
                f"• अनुमानित भाव: ₹{price:,.0f} प्रति क्विंटल\n"
                f"• स्मार्ट स्कोर: {score}/100\n"
                f"• {best_entry.get('reason_text_hi', reason)}"
            )
        else:
            answer = (
                f"🌾 **The best day to sell {crop} is {f_date}!**\n"
                f"• Estimated Price: ₹{price:,.0f} / quintal\n"
                f"• Smart Dispatch Score: {score}/100\n"
                f"• Reason: {reason}"
            )

        return {
            "intent": "BEST_DAY_ADVICE",
            "crop": crop,
            "best_date": f_date,
            "estimated_price": price,
            "best_day_score": score,
            "answer": answer,
            "details": best_entry
        }

    def _handle_price_intent(self, crop: str, center: Optional[Dict], lang: str) -> Dict[str, Any]:
        profile = CROP_PROFILES.get(crop, CROP_PROFILES["Wheat"])
        relevant = [
            r for r in self.cache_records
            if r["crop_type"].lower() == crop.lower()
        ]

        est_price = relevant[0]["predicted_price"] if relevant else profile["base_price"]
        msp = profile["msp"]

        if lang == "hi":
            answer = (
                f"💰 **{crop} मंडी भाव विवरण:**\n"
                f"• वर्तमान अनुमानित भाव: ₹{est_price:,.0f} / क्विंटल\n"
                f"• सरकारी MSP: {('₹' + str(int(msp)) + ' / क्विंटल') if msp > 0 else 'लागू नहीं'}\n"
                f"• 7-दिवसीय रुझान: स्थिर से सकारात्मक"
            )
        else:
            answer = (
                f"💰 **{crop} Price Forecast & Rates:**\n"
                f"• Estimated Current Mandi Rate: ₹{est_price:,.0f} / qtl\n"
                f"• Government MSP: {('₹' + str(int(msp)) + ' / qtl') if msp > 0 else 'N/A'}\n"
                f"• 7-Day Outlook: Stable to favorable"
            )

        return {
            "intent": "PRICE_INQUIRY",
            "crop": crop,
            "estimated_price": est_price,
            "msp": msp,
            "answer": answer
        }

    def _handle_crowd_intent(self, crop: str, center: Optional[Dict], lang: str) -> Dict[str, Any]:
        center_name = center["center_name"] if center else "APMC Mandi Yard"

        if lang == "hi":
            answer = (
                f"👥 **{center_name} भीड़ विश्लेषण:**\n"
                f"• सोमवार और शुक्रवार को आमतौर पर 75-90% स्लॉट भरे रहते हैं।\n"
                f"• न्यूनतम प्रतीक्षा (~15-20 मिनट) के लिए दोपहर 11:00 AM से 2:00 PM के स्लॉट बुक करें।"
            )
        else:
            answer = (
                f"👥 **{center_name} Crowd & Wait Times:**\n"
                f"• Monday & Friday mornings experience heavy rush (75-90% load).\n"
                f"• For minimal queue wait (~15-20 mins), book Tuesday or Thursday midday slots."
            )

        return {
            "intent": "CROWD_STATUS",
            "crop": crop,
            "center": center_name,
            "answer": answer
        }

    def _handle_fallback_intent(self, crop: str, center: Optional[Dict], lang: str) -> Dict[str, Any]:
        if lang == "hi":
            answer = (
                f"नमस्ते किसान भाई! मैं AgriQ स्मार्ट सहायक हूँ। आप मुझसे पूछ सकते हैं:\n"
                f"1. '{crop} बेचने का सबसे अच्छा दिन कौन सा है?'\n"
                f"2. '{crop} का आज का मंडी भाव क्या है?'\n"
                f"3. 'मंडी में भीड़ कब कम होगी?'"
            )
        else:
            answer = (
                f"Hello! I am your AgriQ Smart Mandi Assistant. You can ask me:\n"
                f"1. 'When is the best day to sell {crop}?'\n"
                f"2. 'What is the current mandi rate for {crop}?'\n"
                f"3. 'How can I avoid the long queue at the mandi?'"
            )

        return {
            "intent": "GENERAL_HELP",
            "crop": crop,
            "answer": answer
        }
