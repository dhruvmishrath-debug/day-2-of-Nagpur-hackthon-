import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Battery, Gauge, Shield, Cpu, Zap, Sparkles, Navigation, Plus, Car, Search, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEV } from "@/context/EVContext";
import { VEHICLES, findVehicle, CUSTOM_VEHICLE_ID } from "@/data/vehicles";

const HERO_BG = "https://static.prod-images.emergentagent.com/jobs/0f072ec4-51b7-4eaa-897e-73ecfafd0da9/images/229922d003405d501c20e076401acd4e92e8c5ae20d6a85368658de3730d5f6d.png";
const ABSTRACT = "https://static.prod-images.emergentagent.com/jobs/0f072ec4-51b7-4eaa-897e-73ecfafd0da9/images/08f18b56bc160f6a6d50ea7cc8b520e78e775b764d6dea5ff632ec3ffe88ab33.png";
const BRANDS = Array.from(new Set(VEHICLES.map((v) => v.brand)));
const TABS = [
  { id: "performance", label: "Performance", icon: Gauge },
  { id: "design", label: "Design", icon: CircleDot },
  { id: "safety", label: "Safety", icon: Shield },
  { id: "tech", label: "Tech", icon: Cpu },
  { id: "charging", label: "Charging", icon: Zap },
];

const Home = () => {
  const { vehicle, setVehicle, setForm } = useEV();
  const navigate = useNavigate();

  const activeBrand = useMemo(() => {
    if (vehicle.mode === "custom") return "Custom";
    const v = findVehicle(vehicle.id);
    return v ? v.brand : BRANDS[0];
  }, [vehicle]);

  const [tab, setTab] = useState("design");

  useEffect(() => {
    let range_km = 400;
    if (vehicle.mode === "preset") {
      const v = findVehicle(vehicle.id);
      if (v) range_km = v.range_km;
    } else {
      range_km = Number(vehicle.custom.range_km) || 350;
    }
    setForm((f) => ({ ...f, vehicle_range_km: range_km }));
  }, [vehicle, setForm]);

  const activeVehicle = vehicle.mode === "custom"
    ? {
        id: CUSTOM_VEHICLE_ID,
        brand: vehicle.custom.brand || "Custom",
        model: vehicle.custom.model || "Your EV",
        year: new Date().getFullYear(),
        range_km: Number(vehicle.custom.range_km) || 350,
        battery_kwh: 40, power_kw: 100, fast_charge: "—", color: "#16a34a",
      }
    : findVehicle(vehicle.id) || VEHICLES[0];

  const selectBrand = (brand) => {
    if (brand === "Custom") { setVehicle((s) => ({ ...s, mode: "custom" })); return; }
    const first = VEHICLES.find((v) => v.brand === brand);
    if (first) setVehicle((s) => ({ ...s, mode: "preset", id: first.id }));
  };

  const vehicleOptions = vehicle.mode === "custom" ? [] : VEHICLES.filter((v) => v.brand === activeBrand);
  const gotoDashboard = () => navigate("/dashboard");

  return (
    <main data-testid="home-page" className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] bg-gradient-to-b from-green-50/70 via-stone-50 to-stone-50" />

      <section className="mx-auto max-w-7xl px-6 pb-6 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.h1
                key={activeVehicle.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="font-['Outfit'] text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-5xl"
              >
                {activeVehicle.brand}
                <span className="text-stone-300"> — </span>
                <span className="text-green-700">{activeVehicle.model.split(" ")[0]}</span>
              </motion.h1>
            </AnimatePresence>
            <p className="mt-3 text-sm text-stone-500">{activeVehicle.model} · {activeVehicle.year}</p>
          </div>

          <div className="flex flex-wrap gap-2 rounded-full border border-stone-200 bg-white p-1.5 shadow-sm">
            {[...BRANDS, "Custom"].map((b) => {
              const active = activeBrand === b;
              return (
                <button key={b} data-testid={`brand-${b.toLowerCase()}`} onClick={() => selectBrand(b)} className="relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors">
                  {active && <motion.span layoutId="brand-pill" transition={{ type: "spring", stiffness: 380, damping: 30 }} className="absolute inset-0 rounded-full bg-stone-900" />}
                  <span className={`relative z-10 ${active ? "text-white" : "text-stone-700 hover:text-stone-900"}`}>{b}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <div className="flex flex-row gap-2 overflow-x-auto lg:sticky lg:top-24 lg:flex-col">
              {TABS.map(({ id, label, icon: Ic }) => {
                const active = tab === id;
                return (
                  <button key={id} data-testid={`hero-tab-${id}`} onClick={() => setTab(id)}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 font-['Outfit'] text-sm font-medium transition-all ${active ? "border-stone-900 bg-stone-900 text-white shadow-sm" : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"}`}>
                    <Ic size={14} /> {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            <motion.div key={activeVehicle.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-br from-white via-stone-50 to-green-50 p-8 shadow-sm" style={{ minHeight: 380 }}>
              <div aria-hidden className="absolute inset-0 opacity-60 mix-blend-multiply" style={{ backgroundImage: `url(${ABSTRACT})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-transparent" />
              <div aria-hidden className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{ background: `radial-gradient(closest-side, ${activeVehicle.color}33, transparent)` }} />

              <div className="relative flex min-h-[300px] flex-col items-center justify-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">{activeVehicle.year} · Signature</p>
                <motion.p key={activeVehicle.id + "-n"} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.55 }}
                  className="mt-3 text-center font-['Outfit'] text-4xl font-bold leading-none tracking-tight text-stone-900 sm:text-5xl lg:text-6xl"
                  style={{ WebkitTextStroke: "1px rgba(15,23,42,0.05)" }}>
                  {activeVehicle.model.split(" ")[0].toUpperCase()}
                </motion.p>
                <p className="mt-4 max-w-md text-center text-sm text-stone-600">
                  {activeVehicle.brand} {activeVehicle.model} — engineered for intelligent range and zero-range-anxiety charging.
                </p>
              </div>

              <FloatingBadge style={{ top: "14%", left: "8%" }} label="Range" value={`${activeVehicle.range_km} km`} delay={0.1} />
              <FloatingBadge style={{ top: "14%", right: "8%" }} label="Battery" value={`${activeVehicle.battery_kwh} kWh`} delay={0.2} />
              <FloatingBadge style={{ bottom: "14%", left: "10%" }} label="Power" value={`${activeVehicle.power_kw} kW`} delay={0.3} />
              <FloatingBadge style={{ bottom: "14%", right: "10%" }} label="Fast Charge" value={activeVehicle.fast_charge} delay={0.4} />
            </motion.div>

            {vehicle.mode === "preset" && vehicleOptions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {vehicleOptions.map((v) => {
                  const active = vehicle.id === v.id;
                  return (
                    <button key={v.id} data-testid={`vehicle-chip-${v.id}`}
                      onClick={() => setVehicle((s) => ({ ...s, mode: "preset", id: v.id }))}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${active ? "border-green-600 bg-green-50 text-green-900" : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"}`}>
                      <Car size={14} /> {v.model}
                      <span className="text-xs text-stone-500">{v.range_km}km</span>
                    </button>
                  );
                })}
              </div>
            )}

            {vehicle.mode === "custom" && (
              <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Plus size={14} className="text-green-700" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Custom vehicle</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input data-testid="custom-brand" placeholder="Brand" value={vehicle.custom.brand}
                    onChange={(e) => setVehicle((s) => ({ ...s, custom: { ...s.custom, brand: e.target.value } }))}
                    className="h-10 rounded-xl" />
                  <Input data-testid="custom-model" placeholder="Model" value={vehicle.custom.model}
                    onChange={(e) => setVehicle((s) => ({ ...s, custom: { ...s.custom, model: e.target.value } }))}
                    className="h-10 rounded-xl" />
                  <Input data-testid="custom-range" type="number" placeholder="Range km" value={vehicle.custom.range_km}
                    onChange={(e) => setVehicle((s) => ({ ...s, custom: { ...s.custom, range_km: Number(e.target.value) } }))}
                    className="h-10 rounded-xl" />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }} className="rounded-3xl bg-stone-900 p-6 text-white shadow-lg">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10"><Sparkles size={16} /></span>
                  <div className="leading-tight">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Feature</p>
                    <p className="font-['Outfit'] text-lg font-semibold">{tabToHeadline(tab)}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/95 p-4 text-stone-800">
                  <p className="text-sm leading-relaxed text-stone-700">{tabToDescription(tab, activeVehicle)}</p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <HiStat label="Range" value={`${activeVehicle.range_km} km`} />
                  <HiStat label="Battery" value={`${activeVehicle.battery_kwh} kWh`} />
                </div>
                <button data-testid="feature-card-cta" onClick={gotoDashboard}
                  className="mt-5 flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/20">
                  <span>Launch Dashboard</span><ArrowRight size={14} />
                </button>
              </motion.div>
            </AnimatePresence>

            <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <button onClick={gotoDashboard} className="flex w-full items-center justify-between text-left">
                <span className="flex items-center gap-2 text-sm font-medium text-stone-800"><Plus size={14} /> ev-accessories</span>
                <ArrowRight size={14} className="text-stone-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-green-700">Feature Highlights</p>
            <h2 className="mt-1 font-['Outfit'] text-3xl font-semibold tracking-tight sm:text-4xl">Designed for intelligent charging</h2>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600 sm:flex">
            <Search size={12} /> Colors
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h, i) => (
            <motion.div key={h.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-green-50 text-green-700"><h.icon size={18} /></span>
              <h3 className="mt-4 font-['Outfit'] text-lg font-semibold tracking-tight text-stone-900">{h.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{h.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="relative mt-14 overflow-hidden rounded-3xl">
          <img src={HERO_BG} alt="EV station" className="h-80 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 via-stone-900/30 to-transparent" />
          <div className="absolute inset-0 flex items-center p-8 sm:p-12">
            <div className="max-w-xl text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">One click to charge</p>
              <h3 className="mt-2 font-['Outfit'] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Charge smarter. Arrive worry-free.</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Tell VoltRoute your battery and destination — we'll pick the best station and book your slot.
              </p>
              <Button data-testid="cta-find-station" onClick={gotoDashboard}
                className="mt-5 rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">
                Find best station <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-xs text-stone-500">
        © 2026 VoltRoute — Smart EV Decision Engine
      </footer>
    </main>
  );
};

const FloatingBadge = ({ style, label, value, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, delay }} style={style} className="absolute">
    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay }}
      className="rounded-2xl bg-stone-900/90 px-3 py-2 font-['Outfit'] text-white shadow-lg ring-1 ring-white/10 backdrop-blur">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </motion.div>
  </motion.div>
);

const HiStat = ({ label, value }) => (
  <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{label}</p>
    <p className="font-['Outfit'] text-lg font-semibold text-white">{value}</p>
  </div>
);

const HIGHLIGHTS = [
  { icon: Battery, title: "Smart battery range", body: "Every recommendation checks reachability using your EV's real-world range." },
  { icon: Zap, title: "AI ranking", body: "Groq AI blends distance, wait time, and speed into one decisive score." },
  { icon: Navigation, title: "One-tap navigation", body: "Optimal routes and slot reservations in under 30 seconds." },
  { icon: Shield, title: "Emergency mode", body: "Low battery? We switch to nearest fast charger instantly." },
];

function tabToHeadline(tab) {
  if (tab === "performance") return "Responsive drive";
  if (tab === "design") return "Unsurpassed Range";
  if (tab === "safety") return "Confident journeys";
  if (tab === "tech") return "Intelligent cabin";
  return "Rapid replenishment";
}
function tabToDescription(tab, v) {
  if (tab === "performance") return `${v.power_kw} kW motor delivers smooth torque — ideal for daily commutes and weekend runs.`;
  if (tab === "design") return `A handcrafted ${v.battery_kwh} kWh lithium-ion pack unleashes a ${v.range_km} km range with a potent ${v.power_kw} kW motor. Fast charge ${v.fast_charge}.`;
  if (tab === "safety") return "Advanced driver assistance with collision mitigation, 6 airbags, and structural integrity.";
  if (tab === "tech") return "Over-the-air updates, smart cabin automation, and companion app control.";
  return `Fast charging: ${v.fast_charge}. Compatible with CCS2 DC fast chargers across VoltRoute's curated stations.`;
}

export default Home;
