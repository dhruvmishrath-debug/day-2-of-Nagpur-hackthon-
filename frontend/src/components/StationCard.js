import { Zap, MapPin, Users, Clock } from "lucide-react";
import SlotPulse from "@/components/SlotPulse";

const StationCard = ({ station, isBest, isSelected, onSelect }) => {
  const avail = station.available_slots;
  const availTone = avail === 0 ? "text-red-600" : avail < 3 ? "text-amber-600" : "text-green-700";

  return (
    <button
      data-testid={`station-card-${station.station_id}`}
      onClick={onSelect}
      className={`w-full rounded-xl border bg-white p-3 text-left transition-all hover:shadow-md ${
        isSelected ? "border-green-600 shadow-md ring-1 ring-green-600/20" : "border-stone-200 hover:border-stone-300"
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <p className="flex-1 truncate font-['Outfit'] text-sm font-semibold text-stone-900">{station.name}</p>
        {isBest && <span className="shrink-0 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Best</span>}
        {station.fast_charger_count > 0 && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">Fast</span>}
      </div>
      <p className="mb-2 flex items-center gap-1 text-xs text-stone-500">
        <MapPin size={11} /> {station.distance_km} km • {station.travel_time_min.toFixed(0)} min
      </p>
      <div className="mb-2">
        <SlotPulse available_slots={station.available_slots} wait_time_min={station.wait_time_min} compact />
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-[11px] text-stone-600">
        <Tag icon={<Users size={10} />} value={`${avail}/${station.total_slots}`} tone={availTone} />
        <Tag icon={<Zap size={10} />} value={`${station.charging_rate}kW`} />
        <Tag icon={<Clock size={10} />} value={`${station.wait_time_min.toFixed(0)}min`} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500">Score</span>
        <span className="font-['Outfit'] text-sm font-bold text-green-700">{station.score.toFixed(1)}</span>
      </div>
    </button>
  );
};

const Tag = ({ icon, value, tone = "text-stone-700" }) => (
  <div className={`flex items-center justify-center gap-1 rounded-md bg-stone-50 py-1 font-semibold ${tone}`}>
    {icon} {value}
  </div>
);

export default StationCard;
