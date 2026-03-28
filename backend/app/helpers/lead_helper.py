def is_valid(val):
    return val is not None and str(val).strip() != ""

def extract(lead_data, field):
    return (lead_data.get(field) or {}).get("value")