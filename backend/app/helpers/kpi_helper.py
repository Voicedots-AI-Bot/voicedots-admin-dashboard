import json
import os
from threading import Lock
from app.config.constants import PRICE_PER_1000_CREDITS

KPI_FILE = "app/data/kpi_store.json"


_lock = Lock()


def _load():
    if not os.path.exists(KPI_FILE):
        return {
            "total_conversations": 0,
            "total_messages": 0,
            "total_credits": 0,
            "total_cost_usd": 0,
            "processed_conversations": []
        }
    with open(KPI_FILE, "r") as f:
        return json.load(f)


def _save(data: dict):
    with open(KPI_FILE, "w") as f:
        json.dump(data, f, indent=2)


def add_conversation_kpi(
    *,
    conversation_id: str,
    llm_charge: int,
    call_charge: int,
    messages_count: int
):
    with _lock:
        data = _load()

        # avoid double counting
        if conversation_id in data["processed_conversations"]:
            return

        credits_used = llm_charge + call_charge
        cost = (credits_used / 1000) * PRICE_PER_1000_CREDITS

        data["total_conversations"] += 1
        data["total_messages"] += messages_count
        data["total_credits"] += credits_used
        data["total_cost_usd"] += round(cost, 4)
        data["processed_conversations"].append(conversation_id)

        _save(data)


def get_kpis():
    data = _load()

    avg_cost = (
        data["total_cost_usd"] / data["total_conversations"]
        if data["total_conversations"] > 0
        else 0
    )

    return {
        "total_conversations": data["total_conversations"],
        "total_messages": data["total_messages"],
        "total_credits": data["total_credits"],
        "total_cost_usd": round(data["total_cost_usd"], 2),
        "avg_cost_per_conversation": round(avg_cost, 2)
    }
