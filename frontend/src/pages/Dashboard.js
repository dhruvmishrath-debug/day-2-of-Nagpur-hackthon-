import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Battery, MapPin, Zap, Clock, TriangleAlert, Sparkles, Users, Gauge, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEV } from "@/context/EVContext";
import { recommendStation, explainRecommendation } from "@/lib/api";
import StationMap from "@/components/StationMap";
import StationCard from "@/components/StationCard";
import StationDetail from "@/components/StationDetail";
import BookingDialog from "@/components/BookingDialog";
import TimeBreakdown from "@/components/TimeBreakdown";
import InputPanel from "@/components/InputPanel";
import SlotPulse from "@/components/SlotPulse";
import { toast } from "sonner";

const Dashboard = () => {
  const { form } = useEV();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [onlyFast, setOnlyFast] = useState(false);
  const [explain, setExplain] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await recommendStation({
        battery_level: form.battery_level,
        required_charge: form.required_charge,
        user_lat: form.user_lat,
        user_lng: form.user_lng,
        vehicle_range_km: form.vehicle_range_km,
      });
      setData(res);
      setSelected(res.best);
      if (res.best) {
        setExplaining(true);
        try {
          const e = await explainRecommendation({
            station: res.best, battery_level: form.battery_level, required_charge: form.required_charge, emergency_mode: res.emergency_mode,
          });
          setExplain(e);
        } catch (err) { setExplain({ explanation: "Could not fetch AI explanation.", source: "error" }); }
        finally { setExplaining(false); }
      }
    } catch (e) { toast.error("Failed to load stations. Is the backend running?"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.battery_level, form.required_charge, form.user_lat, form.user_lng]);

  const filteredStations = useMemo(() => {
    if (!data) return [];
    const list = data.ranked || [];
    return onlyFast ? list.filter((s) => s.fast_charger_count > 0) : list;
  }, [data, onlyFast]);

  const emergency = data?.emergency_mode;
  const best = data?.best;

  return (
    <main data-testid="dashboard-page" className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <InputPanel />

      {emergency && (
        <div data-testid="emergency-banner" className="emergency-ring mb-5 flex items-center justify-between gap-3 rounded-2xl bg-red-500 px-5 py-3 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <TriangleAlert className="shrink-0" />
            <div className="leading-tight">
              <p className="font-['Outfit'] text-lg font-bold tracking-tight">Emergency Mode Activated</p>
              <p className="text-sm text-red-50">Battery at {form.battery_level}% — prioritizing nearest station with a fast charger.</p>
            </div>
          </div>
          <span className="hidden rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] sm:inline-block">
            Range ~ {data?.remaining_range_km} km
          </span>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={<Battery size={16} />} label="Battery" value={`${form.battery_level}%`} tone={emergency ? "red" : "green"} testid="stat-battery" />
        <StatTile icon={<Gauge size={16} />} label="Range" value={`${data?.remaining_range_km ?? "—"} km`} testid="stat-range" />
        <StatTile icon={<Zap size={16} />} label="Required" value={`${form.required_charge} kWh`} testid="stat-required" />
        <StatTile icon={<MapPin size={16} />} label="Location" value={`${form.user_lat.toFixed(3)}, ${form.user_lng.toFixed(3)}`} testid="stat-location" />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Nearby stations</p>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{filteredStations.length}</span>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-stone-50 p-3">
              <Label htmlFor="fast-only" className="text-sm font-medium">Fast chargers only</Label>
              <Switch id="fast-only" checked={onlyFast} onCheckedChange={setOnlyFast} data-testid="fast-only-toggle" />
            </div>
            <div className="-mx-1 max-h-[640px] space-y-2 overflow-y-auto px-1">
              {loading && <div className="grid place-items-center py-12 text-sm text-stone-500">Loading stations…</div>}
              {!loading && filteredStations.map((s, idx) => (
                <motion.div key={s.station_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                  <StationCard station={s} isBest={best && s.station_id === best.station_id} isSelected={selected && s.station_id === selected.station_id} onSelect={() => setSelected(s)} />
                </motion.div>
              ))}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-6 space-y-5">
          {best && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              data-testid="recommended-card" className="relative overflow-hidden rounded-2xl border border-green-600/30 bg-gradient-to-br from-green-50/80 via-white to-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-600 text-white"><Sparkles size={18} /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-800">AI recommendation</p>
                    <h2 className="font-['Outfit'] text-2xl font-semibold tracking-tight text-stone-900">{best.name}</h2>
                    <p className="text-sm text-stone-600">{best.address} • {best.distance_km} km away</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-green-700 ring-1 ring-green-600/30" data-testid="recommended-score">Score {best.score}</span>
                  <SlotPulse available_slots={best.available_slots} wait_time_min={best.wait_time_min} />
                  <Button data-testid="book-cta" onClick={() => setBookingOpen(true)} className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700">Book slot</Button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric icon={<Clock size={14} />} label="Travel" value={`${best.travel_time_min} min`} />
                <Metric icon={<Users size={14} />} label="Wait" value={`${best.wait_time_min} min`} />
                <Metric icon={<Zap size={14} />} label="Charge" value={`${best.charging_time_min} min`} />
                <Metric icon={<ShieldCheck size={14} />} label="Fast" value={`${best.fast_charger_count}`} />
              </div>
              <TimeBreakdown travel={best.travel_time_min} wait={best.wait_time_min} charge={best.charging_time_min} />
              <div data-testid="ai-explanation" className="mt-5 rounded-xl border border-green-600/30 bg-green-50/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-green-700" />
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-green-800">Why this station</p>
                  {explain?.source && (
                    <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-700 ring-1 ring-green-600/30">
                      {explain.source === "groq" ? "Groq AI" : explain.source}
                    </span>
                  )}
                </div>
                {explaining ? <p className="text-sm text-green-900/80">Generating AI explanation…</p> : <p className="text-sm leading-relaxed text-green-950">{explain?.explanation || "Loading…"}</p>}
              </div>
            </motion.div>
          )}

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-green-700" />
                <p className="font-['Outfit'] text-sm font-semibold tracking-tight text-stone-900">Station map</p>
              </div>
              <p className="text-xs text-stone-500">Green = available • Red = emergency • Yellow ring = best</p>
            </div>
            <div className="h-[460px] w-full" data-testid="station-map">
              <StationMap stations={filteredStations} user={{ lat: form.user_lat, lng: form.user_lng }} selected={selected} best={best} onSelect={setSelected} emergency={emergency} />
            </div>
          </div>
        </section>

        <aside className="lg:col-span-3">
          <StationDetail station={selected} onBook={() => setBookingOpen(true)} emergency={emergency} />
        </aside>
      </div>

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} station={selected} battery={form.battery_level} required={form.required_charge} />
    </main>
  );
};

const StatTile = ({ icon, label, value, tone = "neutral", testid }) => {
  const toneCls = tone === "red" ? "ring-red-200 bg-red-50 text-red-700" : tone === "green" ? "ring-green-200 bg-green-50 text-green-800" : "ring-stone-200 bg-white text-stone-700";
  return (
    <div data-testid={testid} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <span className={`grid h-9 w-9 place-items-center rounded-xl ring-1 ${toneCls}`}>{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">{label}</p>
        <p className="font-['Outfit'] text-lg font-semibold text-stone-900">{value}</p>
      </div>
    </div>
  );
};

const Metric = ({ icon, label, value }) => (
  <div className="rounded-xl bg-white/70 p-3 ring-1 ring-stone-200">
    <div className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">{icon} {label}</div>
    <p className="font-['Outfit'] text-lg font-semibold text-stone-900">{value}</p>
  </div>
);

export default Dashboard;
