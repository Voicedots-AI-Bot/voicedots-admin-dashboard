import json
import os
from threading import Lock
from datetime import datetime, timezone, timedelta
from app.config.constants import PRICE_PER_1000_CREDITS

KPI_FILE = "app/data/kpi_store.json"
_lock = Lock()

IST = timezone(timedelta(hours=5, minutes=30))


# --------------------------------------------------
# INTERNAL LOAD / SAVE
# --------------------------------------------------
def _load():
    if not os.path.exists(KPI_FILE):
        return {
            "total_conversations": 0,
            "total_messages": 0,
            "total_credits": 0,
            "total_cost_usd": 0,
            "total_call_duration_secs": 0,
            "conversations": [],
        }

    try:
        with open(KPI_FILE, "r") as f:
            return json.load(f)
    except Exception:
        # corrupted file safety
        return {
            "total_conversations": 0,
            "total_messages": 0,
            "total_credits": 0,
            "total_cost_usd": 0,
            "total_call_duration_secs": 0,
            "conversations": [],
        }


def _save(data: dict):
    with open(KPI_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _exists(conversations: list, conversation_id: str) -> bool:
    return any(c["conversation_id"] == conversation_id for c in conversations)


# --------------------------------------------------
# ADD CONVERSATION KPI (SINGLE SOURCE OF TRUTH)
# --------------------------------------------------
def add_conversation_kpi(
    *,
    conversation_id: str,
    llm_charge: int,
    call_charge: int,
    messages_count: int,
    call_duration_secs: int = 0,
    start_time_unix_secs: int | None = None,
):
    with _lock:
        data = _load()

        # ✅ idempotent: never double count
        if _exists(data["conversations"], conversation_id):
            return

        credits_used = llm_charge + call_charge
        cost_usd = (credits_used / 1000) * PRICE_PER_1000_CREDITS

        # ✅ REAL call time (not datetime.now)
        if start_time_unix_secs:
            dt = datetime.fromtimestamp(start_time_unix_secs, IST)
        else:
            # fallback (should rarely happen)
            dt = datetime.now(IST)

        # --- totals ---
        data["total_conversations"] += 1
        data["total_messages"] += messages_count
        data["total_credits"] += credits_used
        data["total_cost_usd"] += round(cost_usd, 4)
        data["total_call_duration_secs"] += call_duration_secs

        # --- per conversation ---
        data["conversations"].append({
            "conversation_id": conversation_id,
            "timestamp": dt.strftime("%I:%M %p"),
            "date": dt.strftime("%d %b %Y"),
            "cost_credits": credits_used,
            "cost_usd": round(cost_usd, 4),
            "call_duration_secs": call_duration_secs,
            "messages_count": messages_count,
        })

        _save(data)


# --------------------------------------------------
# KPI SUMMARY (DASHBOARD)
# --------------------------------------------------
def get_kpis():
    data = _load()

    total_conversations = data.get("total_conversations", 0)
    total_messages = data.get("total_messages", 0)
    total_cost_usd = data.get("total_cost_usd", 0)
    total_call_duration_secs = data.get("total_call_duration_secs", 0)

    avg_cost = (
        total_cost_usd / total_conversations
        if total_conversations > 0
        else 0
    )

    avg_call_duration = (
        total_call_duration_secs / total_conversations
        if total_conversations > 0
        else 0
    )

    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "total_cost_usd": round(total_cost_usd, 2),
        "avg_cost_per_conversation_usd": round(avg_cost, 2),
        "total_call_duration_secs": total_call_duration_secs,
        "avg_call_duration_secs": int(avg_call_duration),
    }


# --------------------------------------------------
# KPI TIMESERIES (FOR GRAPHS)
# --------------------------------------------------
def get_kpis_with_timeseries():
    data = _load()
    conversations = data.get("conversations", [])

    daily = {}

    for conv in conversations:
        date = conv["date"]

        if date not in daily:
            daily[date] = {
                "date": date,
                "conversations": 0,
                "messages": 0,
                "cost_usd": 0,
                "total_call_duration_secs": 0,
            }

        daily[date]["conversations"] += 1
        daily[date]["messages"] += conv.get("messages_count", 0)
        daily[date]["cost_usd"] += conv.get("cost_usd", 0)
        daily[date]["total_call_duration_secs"] += conv.get(
            "call_duration_secs", 0
        )

    timeseries = []
    for day in sorted(daily.values(), key=lambda x: x["date"]):
        avg_call_duration = (
            day["total_call_duration_secs"] / day["conversations"]
            if day["conversations"] > 0
            else 0
        )

        timeseries.append({
            "date": day["date"],
            "conversations": day["conversations"],
            "messages": day["messages"],
            "cost_usd": round(day["cost_usd"], 2),
            "avg_call_duration_secs": int(avg_call_duration),
        })

    return {
        "summary": get_kpis(),
        "timeseries": timeseries,
    }
