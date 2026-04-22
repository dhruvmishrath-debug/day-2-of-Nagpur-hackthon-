import { MapPin, Zap, Users, Clock, Star, Route, DollarSign, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

const StationDetail = ({ station, onBook, emergency }) => {
  if (!station) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
        Select a station to see details.
      </div>
    );
  }

  const navigate = () => {
    const url = `https://www.openstreetmap.org/directions?from=&to=${station.lat}%2C${station.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div data-testid="station-detail" className="sticky top-24 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="relative h-36 w-full overflow-hidden">
        <img src={station.image} alt={station.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">{station.station_id}</p>
          <h3 className="font-['Outfit'] text-xl font-semibold leading-tight tracking-tight">{station.name}</h3>
        </div>
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-stone-900">
          <Star size={12} className="text-amber-500" /> {station.rating}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <p className="flex items-center gap-1 text-sm text-stone-600">
          <MapPin size={13} /> {station.address}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field icon={<Route size={13} />} label="Distance" value={`${station.distance_km} km`} />
          <Field icon={<Clock size={13} />} label="ETA" value={`${station.travel_time_min} min`} />
          <Field icon={<Users size={13} />} label="Available" value={`${station.available_slots}/${station.total_slots}`} />
          <Field icon={<Zap size={13} />} label="Rate" value={`${station.charging_rate} kW`} />
          <Field icon={<Clock size={13} />} label="Wait" value={`${station.wait_time_min} min`} />
          <Field icon={<Zap size={13} />} label="Charge time" value={`${station.charging_time_min} min`} />
          <Field icon={<DollarSign size={13} />} label="Price" value={`₹${station.price_per_kwh}/kWh`} />
          <Field icon={<Zap size={13} />} label="Fast chargers" value={`${station.fast_charger_count}`} />
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <Button
            data-testid="detail-book-btn"
            onClick={onBook}
            className={`h-11 rounded-full font-semibold text-white shadow-sm ${emergency ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
          >
            Book this station
          </Button>
          <Button variant="outline" data-testid="detail-navigate-btn" onClick={navigate} className="h-11 rounded-full border-stone-200 font-semibold text-stone-800 hover:bg-stone-100">
            <Navigation size={14} className="mr-1" /> Navigate
          </Button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon, label, value }) => (
  <div className="rounded-xl bg-stone-50 p-3">
    <div className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">
      {icon} {label}
    </div>
    <p className="font-['Outfit'] text-sm font-semibold text-stone-900">{value}</p>
  </div>
);

export default StationDetail;
