import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, timeout: 30000 });

export const fetchStations = (params) => api.get("/stations", { params }).then((r) => r.data);
export const recommendStation = (payload) => api.post("/recommend", payload).then((r) => r.data);
export const bookSlot = (payload) => api.post("/book-slot", payload).then((r) => r.data);
export const fetchBookings = () => api.get("/bookings").then((r) => r.data);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`).then((r) => r.data);
export const explainRecommendation = (payload) => api.post("/explain", payload).then((r) => r.data);
export const fetchAnalytics = () => api.get("/analytics").then((r) => r.data);
