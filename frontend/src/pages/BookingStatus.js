import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle2, Clock, Phone, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchBookings, cancelBooking } from "@/lib/api";
import { toast } from "sonner";

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
  } catch { return iso; }
};

const BookingStatus = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setItems(await fetchBookings()); }
    catch (e) { toast.error("Failed to load bookings"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onCancel = async (id) => {
    try { await cancelBooking(id); toast.success("Booking cancelled"); load(); }
    catch (e) { toast.error("Cancel failed"); }
  };

  return (
    <main data-testid="bookings-page" className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">Reservations</p>
          <h1 className="mt-1 font-['Outfit'] text-3xl font-semibold tracking-tight sm:text-4xl">Booking Status</h1>
          <p className="mt-2 text-sm text-stone-600">Your charging slot reservations. Bookings are stored in-memory for the current session.</p>
        </div>
        <Link to="/dashboard" data-testid="book-new-link" className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
          Book another slot
        </Link>
      </div>

      {loading && <div className="grid place-items-center rounded-2xl border border-stone-200 bg-white py-14 text-stone-500">Loading bookings…</div>}

      {!loading && items.length === 0 && (
        <div data-testid="bookings-empty" className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <Calendar className="mx-auto text-stone-400" size={32} />
          <p className="mt-3 font-['Outfit'] text-xl font-semibold">No bookings yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">Head to the dashboard, pick a recommended station, and reserve your charging slot.</p>
          <Link to="/dashboard" className="mt-5 inline-block rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">
            Go to dashboard
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {items.map((b) => (
          <div key={b.booking_id} data-testid={`booking-${b.booking_id}`} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Slot #{b.slot_number}</p>
                <h3 className="mt-1 font-['Outfit'] text-xl font-semibold text-stone-900">{b.station_name}</h3>
                <p className="text-xs text-stone-500">ID {b.station_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${b.status === "CONFIRMED" ? "bg-green-50 text-green-800 ring-1 ring-green-600/30" : "bg-stone-100 text-stone-600"}`}>
                  <CheckCircle2 size={12} /> {b.status}
                </span>
                {b.status === "CONFIRMED" && (
                  <Button variant="ghost" size="sm" data-testid={`cancel-${b.booking_id}`} onClick={() => onCancel(b.booking_id)}
                    className="rounded-full text-red-600 hover:bg-red-50 hover:text-red-700">
                    <Trash2 size={14} className="mr-1" /> Cancel
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <Detail icon={<User size={14} />} label="Name" value={b.name} />
              <Detail icon={<Phone size={14} />} label="Phone" value={b.phone} />
              <Detail icon={<Clock size={14} />} label="Start" value={formatTime(b.start_time)} />
              <Detail icon={<Clock size={14} />} label="End" value={formatTime(b.end_time)} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

const Detail = ({ icon, label, value }) => (
  <div className="rounded-xl bg-stone-50 p-3">
    <div className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">{icon} {label}</div>
    <p className="font-['Outfit'] text-sm font-semibold text-stone-900">{value}</p>
  </div>
);

export default BookingStatus;
