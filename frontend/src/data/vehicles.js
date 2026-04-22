export const VEHICLES = [
  { id: "tata-nexon",   brand: "Tata",      model: "Nexon EV Max",   year: 2026, range_km: 465, battery_kwh: 40.5, power_kw: 105, fast_charge: "0-80% in 56 min", color: "#0f172a" },
  { id: "tata-tiago",   brand: "Tata",      model: "Tiago EV",       year: 2025, range_km: 315, battery_kwh: 24,   power_kw: 55,  fast_charge: "10-80% in 57 min", color: "#0369a1" },
  { id: "mahindra-xuv", brand: "Mahindra",  model: "XUV400 EV",      year: 2026, range_km: 456, battery_kwh: 39.4, power_kw: 110, fast_charge: "0-80% in 50 min", color: "#b91c1c" },
  { id: "hyundai-kona", brand: "Hyundai",   model: "Kona Electric",  year: 2025, range_km: 452, battery_kwh: 39.2, power_kw: 100, fast_charge: "0-80% in 54 min", color: "#1d4ed8" },
  { id: "mg-zs",        brand: "MG",        model: "ZS EV",          year: 2026, range_km: 461, battery_kwh: 50.3, power_kw: 130, fast_charge: "0-80% in 60 min", color: "#7c3aed" },
  { id: "kia-ev6",      brand: "Kia",       model: "EV6",            year: 2026, range_km: 708, battery_kwh: 77.4, power_kw: 168, fast_charge: "10-80% in 18 min", color: "#0891b2" },
  { id: "byd-atto",     brand: "BYD",       model: "Atto 3",         year: 2026, range_km: 521, battery_kwh: 60.5, power_kw: 150, fast_charge: "0-80% in 45 min", color: "#059669" },
  { id: "ather-450x",   brand: "Ather",     model: "450X",           year: 2026, range_km: 150, battery_kwh: 3.7,  power_kw: 6,   fast_charge: "0-80% in 4h 30m", color: "#16a34a" },
  { id: "ola-s1",       brand: "Ola",       model: "S1 Pro",         year: 2026, range_km: 195, battery_kwh: 4.0,  power_kw: 8.5, fast_charge: "0-80% in 6h 30m", color: "#ea580c" },
  { id: "bmw-i4",       brand: "BMW",       model: "i4 eDrive40",    year: 2026, range_km: 590, battery_kwh: 83.9, power_kw: 250, fast_charge: "10-80% in 31 min", color: "#111827" },
];
export const CUSTOM_VEHICLE_ID = "__custom__";
export const findVehicle = (id) => VEHICLES.find((v) => v.id === id);
