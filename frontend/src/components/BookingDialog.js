import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Share2 } from "lucide-react";
import { bookSlot } from "@/lib/api";
import { toast } from "sonner";

const BookingDialog = ({ open, onOpenChange, station, battery, required }) => {
  const [form, setForm] = useState({ name: "", phone: "", expected_arrival: "18:00" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const reset = () => {
    setConfirmation(null);
    setForm({ name: "", phone: "", expected_arrival: "18:00" });
  };

  const submit = async () => {
    if (!station) return;
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please enter your name and phone");
      return;
    }
    setSubmitting(true);
    try {
      const res = await bookSlot({
        station_id: station.station_id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        expected_arrival: form.expected_arrival,
        required_charge: required,
        battery_level: battery,
      });
      setConfirmation(res);
      toast.success("Slot booked successfully");
    } catch (e) {
      toast.error("Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (next) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="booking-dialog" className="sm:max-w-md">
        {!confirmation ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-['Outfit'] text-2xl font-semibold tracking-tight">Book your slot</DialogTitle>
              <DialogDescription className="text-stone-600">
                Reserve a charging slot at <span className="font-semibold text-stone-900">{station?.name}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Full name</Label>
                <Input id="name" data-testid="booking-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Alex Driver" className="mt-2 h-11 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Phone number</Label>
                <Input id="phone" data-testid="booking-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" className="mt-2 h-11 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="arrival" className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Expected arrival time</Label>
                <Input id="arrival" data-testid="booking-arrival" type="time" value={form.expected_arrival} onChange={(e) => setForm((f) => ({ ...f, expected_arrival: e.target.value }))} className="mt-2 h-11 rounded-xl" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => handleOpenChange(false)} className="rounded-full" data-testid="booking-cancel">Cancel</Button>
              <Button data-testid="booking-submit" onClick={submit} disabled={submitting} className="rounded-full bg-green-600 px-6 text-white hover:bg-green-700">
                {submitting ? "Reserving…" : "Reserve slot"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center py-6">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-green-100 text-green-700">
                <CheckCircle2 size={28} />
              </span>
              <DialogTitle className="mt-4 font-['Outfit'] text-2xl font-semibold tracking-tight">Slot booked successfully</DialogTitle>
              <p className="mt-2 text-center text-sm text-stone-600">{confirmation.station_name}</p>
              <div data-testid="booking-confirmation" className="mt-5 w-full space-y-2 rounded-2xl bg-green-50 p-5 ring-1 ring-green-600/30">
                <Row label="Slot" value={`#${confirmation.slot_number}`} />
                <Row label="Start" value={new Date(confirmation.start_time).toLocaleString()} />
                <Row label="End" value={new Date(confirmation.end_time).toLocaleString()} />
                <Row label="Booking ID" value={confirmation.booking_id.slice(0, 8)} />
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-full" data-testid="booking-close">Close</Button>
              <Button
                variant="outline"
                data-testid="booking-whatsapp"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `🔋 VoltRoute booking confirmed!\n\nStation: ${confirmation.station_name}\nSlot: #${confirmation.slot_number}\nStart: ${new Date(confirmation.start_time).toLocaleString()}\nEnd: ${new Date(confirmation.end_time).toLocaleString()}\nBooking ID: ${confirmation.booking_id.slice(0, 8)}`
                  );
                  window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
                }}
                className="rounded-full border-green-600 text-green-700 hover:bg-green-50"
              >
                <Share2 size={14} className="mr-1" /> Share on WhatsApp
              </Button>
              <Link to="/bookings">
                <Button onClick={() => handleOpenChange(false)} data-testid="booking-view-all" className="w-full rounded-full bg-green-600 px-6 text-white hover:bg-green-700">
                  View all bookings
                </Button>
              </Link>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold uppercase tracking-[0.15em] text-green-800">{label}</span>
    <span className="font-['Outfit'] text-sm font-semibold text-green-950">{value}</span>
  </div>
);

export default BookingDialog;
