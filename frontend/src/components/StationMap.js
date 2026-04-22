import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";

const buildIcon = ({ variant = "normal", label = "" }) => {
  const cls =
    variant === "best" ? "ev-marker ev-marker-best" :
    variant === "emergency" ? "ev-marker ev-marker-emergency" : "ev-marker ev-marker-normal";
  return L.divIcon({
    html: `<div class="${cls}">${label}</div>`,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const userIcon = L.divIcon({
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#0f172a;border:4px solid #fde68a;box-shadow:0 0 0 4px rgba(15,23,42,0.15);"></div>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const FocusController = ({ selected }) => {
  const map = useMap();
  useEffect(() => {
    if (selected) map.flyTo([selected.lat, selected.lng], 14, { duration: 0.8 });
  }, [selected, map]);
  return null;
};

const UserFocusController = ({ user }) => {
  const map = useMap();
  useEffect(() => {
    if (user && typeof user.lat === "number" && typeof user.lng === "number") {
      map.flyTo([user.lat, user.lng], 12, { duration: 0.8 });
    }
  }, [user?.lat, user?.lng, map]);
  return null;
};

const StationMap = ({ stations = [], user, selected, best, onSelect, emergency = false }) => (
  <MapContainer
    center={[user.lat, user.lng]}
    zoom={12}
    scrollWheelZoom
    zoomControl
    className="h-full w-full"
    style={{ height: "100%", width: "100%" }}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[user.lat, user.lng]} icon={userIcon}>
      <Popup>You are here</Popup>
    </Marker>
    {best && (
      <Polyline
        positions={[[user.lat, user.lng], [best.lat, best.lng]]}
        pathOptions={{ color: "#16a34a", weight: 4, opacity: 0.8, dashArray: "8 8" }}
      />
    )}
    {stations.map((s) => {
      const isBest = best && s.station_id === best.station_id;
      const variant = isBest ? "best" : emergency ? "emergency" : "normal";
      const label = s.fast_charger_count > 0 ? "⚡" : "";
      return (
        <Marker
          key={s.station_id}
          position={[s.lat, s.lng]}
          icon={buildIcon({ variant, label })}
          eventHandlers={{ click: () => onSelect && onSelect(s) }}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontFamily: "Outfit, sans-serif" }}>{s.name}</div>
              <div style={{ fontSize: 12, color: "#57534e", marginTop: 2 }}>
                {s.distance_km} km • {s.available_slots}/{s.total_slots} slots
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                ⚡ {s.charging_rate} kW · {s.fast_charger_count} fast
              </div>
            </div>
          </Popup>
        </Marker>
      );
    })}
    <FocusController selected={selected} />
    <UserFocusController user={user} />
  </MapContainer>
);

export default StationMap;
