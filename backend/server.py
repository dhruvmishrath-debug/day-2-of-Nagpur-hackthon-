"""Smart EV Charging Decision Engine — FastAPI backend."""
import csv
import logging
import math
import os
import random
import uuid
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from groq import AsyncGroq
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ev-backend")

app = FastAPI(title="Smart EV Charging Decision Engine")
api_router = APIRouter(prefix="/api")

CITY_CENTER = {"lat": 12.9716, "lng": 77.5946}
STATION_IMAGES = [
    "https://images.pexels.com/photos/31960307/pexels-photo-31960307.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.pexels.com/photos/29163104/pexels-photo-29163104.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1671785253964-bdb43087ed99?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwzfHxFViUyMGNoYXJnaW5nJTIwc3RhdGlvbnxlbnwwfHx8fDE3NzY4NDM5MzR8MA&ixlib=rb-4.1.0&q=85",
]
STATION_NAMES = [
    "Volt Haven Whitefield", "Green Spark Koramangala", "EcoCharge Indiranagar",
    "BoltHub HSR Layout", "PowerGrid MG Road", "CurrentWave Jayanagar",
    "Photon Plug Hebbal", "Amp Station BTM", "ElectriCity JP Nagar",
    "IonSpot Yelahanka", "Voltflow Marathahalli", "ChargeWorks Electronic City",
    "KiloWatt Basavanagudi", "EcoPlug Rajajinagar", "SparkPoint Malleshwaram",
    "GreenGrid Bellandur",
]

def _seed_stations() -> List[dict]:
    rng = random.Random(42)
    stations = []
    for i, name in enumerate(STATION_NAMES):
        dlat = rng.uniform(-0.14, 0.14)
        dlng = rng.uniform(-0.14, 0.14)
        total_slots = rng.choice([4, 6, 8, 10, 12])
        available = rng.randint(0, total_slots)
        fast = rng.randint(0, min(total_slots, 6))
        rate = rng.choice([22, 30, 45, 50, 60, 75, 100, 150])
        pricing = rng.choice(["peak", "off-peak"])
        price_per_kwh = round(rng.uniform(10, 28), 2)
        stations.append({
            "station_id": f"ST-{i+1:03d}",
            "name": name,
            "lat": round(CITY_CENTER["lat"] + dlat, 6),
            "lng": round(CITY_CENTER["lng"] + dlng, 6),
            "total_slots": total_slots,
            "available_slots": available,
            "fast_charger_count": fast,
            "charging_rate": rate,
            "pricing": pricing,
            "price_per_kwh": price_per_kwh,
            "rating": round(rng.uniform(3.6, 4.9), 1),
            "image": STATION_IMAGES[i % len(STATION_IMAGES)],
            "address": f"{rng.choice(['MG', 'Outer', 'Ring', 'Hosur', '100 Ft'])} Road, Bangalore",
        })
    return stations

STATIONS: List[dict] = _seed_stations()
BOOKINGS: List[dict] = []
SLOT_ALLOCATIONS: dict = defaultdict(list)


class UserInput(BaseModel):
    battery_level: float = Field(..., ge=0, le=100)
    required_charge: float = Field(..., ge=1, le=100)
    user_lat: float = CITY_CENTER["lat"]
    user_lng: float = CITY_CENTER["lng"]
    vehicle_range_km: float = 400.0
    arrival_time: Optional[str] = None
    departure_time: Optional[str] = None


class StationOut(BaseModel):
    station_id: str
    name: str
    lat: float
    lng: float
    total_slots: int
    available_slots: int
    fast_charger_count: int
    charging_rate: float
    pricing: str
    price_per_kwh: float
    rating: float
    image: str
    address: str
    distance_km: float
    travel_time_min: float
    wait_time_min: float
    charging_time_min: float
    reachable: bool
    score: float = 0.0


class RecommendResponse(BaseModel):
    best: Optional[StationOut]
    ranked: List[StationOut]
    emergency_mode: bool
    remaining_range_km: float


class BookingRequest(BaseModel):
    station_id: str
    name: str
    phone: str
    expected_arrival: str
    required_charge: float = 40.0
    battery_level: float = 50.0


class BookingOut(BaseModel):
    booking_id: str
    station_id: str
    station_name: str
    name: str
    phone: str
    slot_number: int
    start_time: str
    end_time: str
    status: str
    created_at: str
    expected_arrival: str


class ExplainRequest(BaseModel):
    station: StationOut
    battery_level: float
    required_charge: float
    emergency_mode: bool


def _haversine(lat1, lng1, lat2, lng2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def _enrich_station(station, user_lat, user_lng, required_charge):
    dist = _haversine(user_lat, user_lng, station["lat"], station["lng"])
    travel_time = (dist / 35.0) * 60.0
    if station["available_slots"] > 0:
        wait_time = 0.0
    else:
        wait_time = random.Random(hash(station["station_id"]) & 0xFFFFFFFF).uniform(8, 25)
    charging_time = (required_charge / max(station["charging_rate"], 1)) * 60.0
    out = {**station}
    out["distance_km"] = round(dist, 2)
    out["travel_time_min"] = round(travel_time, 1)
    out["wait_time_min"] = round(wait_time, 1)
    out["charging_time_min"] = round(charging_time, 1)
    return out


def _score_station(s, battery_level, remaining_range, emergency):
    dist = s["distance_km"]
    wait = s["wait_time_min"]
    travel = s["travel_time_min"]
    charge_t = s["charging_time_min"]
    rate = s["charging_rate"]
    fast_bonus = -10 if s["fast_charger_count"] > 0 else 0
    avail_penalty = 0 if s["available_slots"] > 0 else 15
    urgency = max(0, (20 - battery_level)) * 1.2
    if emergency:
        raw = dist * 3.0 + travel * 0.6 + fast_bonus - (rate * 0.15) + avail_penalty + urgency * 1.5
    else:
        raw = dist * 1.5 + travel * 0.4 + wait * 0.8 + charge_t * 0.2 + fast_bonus - (rate * 0.1) + avail_penalty + urgency
    if dist > remaining_range:
        raw += 500
    return round(max(0, 100 - raw), 1)


@api_router.get("/")
async def root():
    return {"message": "Smart EV Charging Decision Engine", "stations": len(STATIONS)}


@api_router.get("/stations", response_model=List[StationOut])
async def list_stations(
    user_lat: float = CITY_CENTER["lat"],
    user_lng: float = CITY_CENTER["lng"],
    required_charge: float = 40.0,
    battery_level: float = 50.0,
    vehicle_range_km: float = 400.0,
    limit: int = 16,
):
    remaining_range = (battery_level / 100.0) * vehicle_range_km
    emergency = battery_level < 15
    enriched = [_enrich_station(s, user_lat, user_lng, required_charge) for s in STATIONS]
    for e in enriched:
        e["reachable"] = e["distance_km"] <= remaining_range
        e["score"] = _score_station(e, battery_level, remaining_range, emergency)
    enriched.sort(key=lambda x: x["distance_km"])
    return enriched[:limit]


@api_router.post("/recommend", response_model=RecommendResponse)
async def recommend(data: UserInput):
    remaining_range = (data.battery_level / 100.0) * data.vehicle_range_km
    emergency = data.battery_level < 15
    enriched = [_enrich_station(s, data.user_lat, data.user_lng, data.required_charge) for s in STATIONS]
    for e in enriched:
        e["reachable"] = e["distance_km"] <= remaining_range
        e["score"] = _score_station(e, data.battery_level, remaining_range, emergency)
    if emergency:
        enriched.sort(key=lambda x: (not x["reachable"], -int(x["fast_charger_count"] > 0), x["distance_km"]))
    else:
        enriched.sort(key=lambda x: (not x["reachable"], -x["score"]))
    best = enriched[0] if enriched else None
    return {"best": best, "ranked": enriched[:10], "emergency_mode": emergency, "remaining_range_km": round(remaining_range, 1)}


def _allocate_slot(station_id, expected_arrival, charge_min):
    try:
        if "T" in expected_arrival:
            start_dt = datetime.fromisoformat(expected_arrival.replace("Z", "+00:00"))
        else:
            now = datetime.now(timezone.utc)
            hh, mm = expected_arrival.split(":")[:2]
            start_dt = now.replace(hour=int(hh), minute=int(mm), second=0, microsecond=0)
    except Exception:
        start_dt = datetime.now(timezone.utc) + timedelta(minutes=15)
    end_dt = start_dt + timedelta(minutes=max(15, int(charge_min)))
    station = next((s for s in STATIONS if s["station_id"] == station_id), None)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    overlapping = 0
    for a_start, a_end, _ in SLOT_ALLOCATIONS[station_id]:
        if not (end_dt <= a_start or start_dt >= a_end):
            overlapping += 1
    slot_number = (overlapping % station["total_slots"]) + 1
    SLOT_ALLOCATIONS[station_id].append((start_dt, end_dt, slot_number))
    return slot_number, start_dt.isoformat(), end_dt.isoformat()


@api_router.post("/book-slot", response_model=BookingOut)
async def book_slot(req: BookingRequest):
    station = next((s for s in STATIONS if s["station_id"] == req.station_id), None)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    charge_min = (req.required_charge / max(station["charging_rate"], 1)) * 60.0
    slot_number, start_iso, end_iso = _allocate_slot(req.station_id, req.expected_arrival, charge_min)
    booking = {
        "booking_id": str(uuid.uuid4()),
        "station_id": station["station_id"],
        "station_name": station["name"],
        "name": req.name,
        "phone": req.phone,
        "slot_number": slot_number,
        "start_time": start_iso,
        "end_time": end_iso,
        "status": "CONFIRMED",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expected_arrival": req.expected_arrival,
    }
    BOOKINGS.append(booking)
    return booking


@api_router.get("/bookings", response_model=List[BookingOut])
async def list_bookings():
    return list(reversed(BOOKINGS))


@api_router.delete("/bookings/{booking_id}")
async def cancel_booking(booking_id: str):
    for b in BOOKINGS:
        if b["booking_id"] == booking_id:
            b["status"] = "CANCELLED"
            return {"ok": True}
    raise HTTPException(status_code=404, detail="Booking not found")


@api_router.post("/explain")
async def explain(req: ExplainRequest):
    if not GROQ_API_KEY:
        return {"explanation": "AI disabled.", "source": "fallback"}
    client = AsyncGroq(api_key=GROQ_API_KEY)
    s = req.station
    emergency_ctx = "Battery is CRITICALLY LOW (emergency mode). " if req.emergency_mode else ""
    prompt = f"""You are an EV charging assistant. In 2-3 warm, practical sentences, explain why the recommended station is the best choice. Avoid bullet points.

Driver context:
- Battery: {req.battery_level}%  {emergency_ctx}
- Required: {req.required_charge} kWh

Station:
- {s.name}, {s.distance_km} km ({s.travel_time_min:.0f} min)
- Slots: {s.available_slots}/{s.total_slots}, fast chargers: {s.fast_charger_count}
- Rate: {s.charging_rate} kW (~{s.charging_time_min:.0f} min)
- Wait: {s.wait_time_min:.0f} min, rating {s.rating}/5, pricing {s.pricing}
"""
    try:
        resp = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a concise, friendly EV charging advisor."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=220,
        )
        return {"explanation": resp.choices[0].message.content.strip(), "source": "groq", "model": GROQ_MODEL}
    except Exception as e:
        logger.error(f"Groq error: {e}")
        fb = f"{s.name} is {s.distance_km} km away with {s.available_slots} slots and {s.fast_charger_count} fast chargers at {s.charging_rate} kW — a strong match."
        return {"explanation": fb, "source": "fallback", "error": str(e)}


def _load_csv_stats():
    path = ROOT_DIR / "data" / "ev_charging_patterns.csv"
    stats = {
        "total_sessions": 0, "charger_type_distribution": {}, "avg_duration_hours": 0,
        "avg_energy_kwh": 0, "avg_cost_usd": 0, "sessions_by_time_of_day": {},
        "sessions_by_day_of_week": {}, "top_locations": {}, "avg_rate_by_charger": {},
    }
    if not path.exists():
        return stats
    try:
        rows = list(csv.DictReader(path.open()))
        stats["total_sessions"] = len(rows)
        cc, tc, dc, lc = Counter(), Counter(), Counter(), Counter()
        rbc = defaultdict(list)
        durations, energies, costs = [], [], []
        for r in rows:
            ch = r.get("Charger Type", "").strip()
            if ch:
                cc[ch] += 1
                try: rbc[ch].append(float(r.get("Charging Rate (kW)", 0) or 0))
                except ValueError: pass
            tod = r.get("Time of Day", "").strip()
            if tod: tc[tod] += 1
            dow = r.get("Day of Week", "").strip()
            if dow: dc[dow] += 1
            loc = r.get("Charging Station Location", "").strip()
            if loc: lc[loc] += 1
            for key, bucket in (("Charging Duration (hours)", durations), ("Energy Consumed (kWh)", energies), ("Charging Cost (USD)", costs)):
                try: bucket.append(float(r.get(key, 0) or 0))
                except ValueError: pass
        stats["charger_type_distribution"] = dict(cc)
        stats["sessions_by_time_of_day"] = dict(tc)
        stats["sessions_by_day_of_week"] = dict(dc)
        stats["top_locations"] = dict(lc.most_common(5))
        stats["avg_duration_hours"] = round(sum(durations) / len(durations), 2) if durations else 0
        stats["avg_energy_kwh"] = round(sum(energies) / len(energies), 2) if energies else 0
        stats["avg_cost_usd"] = round(sum(costs) / len(costs), 2) if costs else 0
        stats["avg_rate_by_charger"] = {k: round(sum(v) / len(v), 2) if v else 0 for k, v in rbc.items()}
    except Exception as e:
        logger.error(f"CSV error: {e}")
    return stats


_CACHED_STATS = None

@api_router.get("/analytics")
async def analytics():
    global _CACHED_STATS
    if _CACHED_STATS is None:
        _CACHED_STATS = _load_csv_stats()
    return _CACHED_STATS


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
