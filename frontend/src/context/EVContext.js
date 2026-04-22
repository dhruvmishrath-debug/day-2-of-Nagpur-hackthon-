import { createContext, useContext, useState, useMemo } from "react";
import { VEHICLES } from "@/data/vehicles";

const EVContext = createContext(null);

export const EVProvider = ({ children }) => {
  const [form, setForm] = useState({
    battery_level: 42,
    required_charge: 30,
    vehicle_range_km: VEHICLES[0].range_km,
    user_lat: 12.9716,
    user_lng: 77.5946,
    locationLabel: "MG Road, Bangalore",
  });
  const [vehicle, setVehicle] = useState({
    mode: "preset",
    id: VEHICLES[0].id,
    custom: { brand: "", model: "", range_km: 350 },
  });
  const value = useMemo(() => ({ form, setForm, vehicle, setVehicle }), [form, vehicle]);
  return <EVContext.Provider value={value}>{children}</EVContext.Provider>;
};

export const useEV = () => {
  const ctx = useContext(EVContext);
  if (!ctx) throw new Error("useEV must be used inside EVProvider");
  return ctx;
};
