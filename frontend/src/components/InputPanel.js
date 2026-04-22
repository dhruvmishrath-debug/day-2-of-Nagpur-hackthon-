import { useState } from "react";
import { Car, Crosshair, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEV } from "@/context/EVContext";
import { VEHICLES, findVehicle } from "@/data/vehicles";

const LOCATIONS = [
  { label: "MG Road, Bangalore", lat: 12.9716, lng: 77.5946 },
  { label: "Whitefield, Bangalore", lat: 12.9698, lng: 77.75 },
  { label: "Koramangala, Bangalore", lat: 12.9352, lng: 77.6245 },
  { label: "Hebbal, Bangalore", lat: 13.0358, lng: 77.597 },
  { label: "Electronic City, Bangalore", lat: 12.8452, lng: 77.6602 },
];
const CUSTOM_LOC = "__custom_loc__";

const InputPanel = () => {
  const { form, setForm, vehicle, setVehicle } = useEV();
  const emergency = form.battery_level < 15;
  const [locating, setLocating] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);

  const currentVehicle = vehicle.mode === "custom" ? "__custom__" : vehicle.id || VEHICLES[0].id;

  const onVehicleChange = (val) => {
    if (val === "__custom__") {
      setVehicle((s) => ({ ...s, mode: "custom" }));
      return;
    }
    const v = findVehicle(val);
    if (v) {
      setVehicle((s) => ({ ...s, mode: "preset", id: v.id }));
      setForm((f) => ({ ...f, vehicle_range_km: v.range_km }));
    }
  };

  const onLocChange = (label) => {
    if (label === CUSTOM_LOC) {
      setCustomOpen(true);
      setForm((f) => ({ ...f, locationLabel: "Custom coordinates" }));
      return;
    }
    setCustomOpen(false);
    const m = LOCATIONS.find((l) => l.label === label);
    if (m) setForm((f) => ({ ...f, user_lat: m.lat, user_lng: m.lng, locationLabel: m.label }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((f) => ({
          ...f,
          user_lat: Number(latitude.toFixed(6)),
          user_lng: Number(longitude.toFixed(6)),
          locationLabel: `My location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
        }));
        setCustomOpen(false);
        toast.success("Location detected");
        setLocating(false);
      },
      (err) => {
        toast.error(`Location failed: ${err.message}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const activeVehicleLabel = vehicle.mode === "custom"
    ? `${vehicle.custom.brand || "Custom"} ${vehicle.custom.model || ""}`.trim() || "Custom vehicle"
    : (() => {
        const v = findVehicle(vehicle.id);
        return v ? `${v.brand} ${v.model}` : "Select vehicle";
      })();

  const selectValueForLoc = LOCATIONS.some((l) => l.label === form.locationLabel)
    ? form.locationLabel
    : customOpen ? CUSTOM_LOC : form.locationLabel;

  return (
    <div data-testid="dashboard-input-panel" className="mb-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
            <Car size={12} /> Vehicle
          </Label>
          <Select value={currentVehicle} onValueChange={onVehicleChange}>
            <SelectTrigger data-testid="dash-vehicle-select" className="mt-1 h-11 rounded-xl">
              <SelectValue>{activeVehicleLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {VEHICLES.map((v) => (
                <SelectItem key={v.id} value={v.id} data-testid={`dash-vehicle-${v.id}`}>
                  <span className="font-medium">{v.brand} {v.model}</span>
                  <span className="ml-2 text-xs text-stone-500">{v.range_km} km</span>
                </SelectItem>
              ))}
              <SelectItem value="__custom__" data-testid="dash-vehicle-custom">
                <span className="font-medium text-green-700">+ Custom vehicle…</span>
              </SelectItem>
            </SelectContent>
          </Select>
          {vehicle.mode === "custom" && (
            <div className="mt-3 grid gap-2 rounded-xl bg-stone-50 p-3 sm:grid-cols-3">
              <Input data-testid="dash-custom-brand" placeholder="Brand" value={vehicle.custom.brand}
                onChange={(e) => setVehicle((s) => ({ ...s, custom: { ...s.custom, brand: e.target.value } }))}
                className="h-9 rounded-lg" />
              <Input data-testid="dash-custom-model" placeholder="Model" value={vehicle.custom.model}
                onChange={(e) => setVehicle((s) => ({ ...s, custom: { ...s.custom, model: e.target.value } }))}
                className="h-9 rounded-lg" />
              <Input data-testid="dash-custom-range" type="number" placeholder="Range km" value={vehicle.custom.range_km}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setVehicle((s) => ({ ...s, custom: { ...s.custom, range_km: n } }));
                  setForm((f) => ({ ...f, vehicle_range_km: n || 350 }));
                }}
                className="h-9 rounded-lg" />
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Label className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Battery</Label>
          <div className="mt-1 flex items-end gap-2">
            <span className={`font-['Outfit'] text-2xl font-bold ${emergency ? "text-red-600" : "text-stone-900"}`} data-testid="dash-battery-display">
              {form.battery_level}%
            </span>
            <span className="mb-1 text-xs text-stone-500">≈ {Math.round((form.battery_level / 100) * form.vehicle_range_km)} km</span>
          </div>
          <Slider data-testid="dash-battery-slider" className="mt-2" value={[form.battery_level]}
            onValueChange={([v]) => setForm((f) => ({ ...f, battery_level: v }))} min={1} max={100} step={1} />
        </div>

        <div className="lg:col-span-2">
          <Label className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Required (kWh)</Label>
          <Input data-testid="dash-required-charge" type="number" min={5} max={100} value={form.required_charge}
            onChange={(e) => setForm((f) => ({ ...f, required_charge: Number(e.target.value) }))}
            className="mt-1 h-11 rounded-xl text-base font-semibold" />
        </div>

        <div className="lg:col-span-4">
          <Label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
            <MapPin size={12} /> Location
          </Label>
          <div className="mt-1 flex gap-2">
            <Select value={selectValueForLoc} onValueChange={onLocChange}>
              <SelectTrigger data-testid="dash-location-select" className="h-11 rounded-xl">
                <SelectValue>{form.locationLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l.label} value={l.label} data-testid={`dash-loc-${l.label}`}>{l.label}</SelectItem>
                ))}
                <SelectItem value={CUSTOM_LOC} data-testid="dash-loc-custom">
                  <span className="font-medium text-green-700">+ Custom coordinates…</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={useMyLocation} data-testid="dash-use-my-location" disabled={locating}
              className="h-11 shrink-0 rounded-xl border-stone-200 px-3 font-semibold text-stone-800 hover:bg-stone-100">
              <Crosshair size={14} className="mr-1" />
              {locating ? "Locating…" : "My location"}
            </Button>
          </div>
          {customOpen && (
            <div className="mt-3 grid gap-2 rounded-xl bg-stone-50 p-3 sm:grid-cols-2">
              <Input data-testid="dash-custom-lat" type="number" step="0.0001" placeholder="Latitude" value={form.user_lat}
                onChange={(e) => setForm((f) => ({ ...f, user_lat: Number(e.target.value) }))} className="h-9 rounded-lg" />
              <Input data-testid="dash-custom-lng" type="number" step="0.0001" placeholder="Longitude" value={form.user_lng}
                onChange={(e) => setForm((f) => ({ ...f, user_lng: Number(e.target.value) }))} className="h-9 rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
