import { useEffect, useState } from "react";

const SlotPulse = ({ available_slots = 0, wait_time_min = 0, compact = false }) => {
  const isAvailable = available_slots > 0;
  const baseSeconds = Math.max(5, Math.round((wait_time_min || 5) * 60));
  const [seconds, setSeconds] = useState(baseSeconds);

  useEffect(() => {
    if (isAvailable) return undefined;
    setSeconds(baseSeconds);
    const id = setInterval(() => {
      setSeconds((s) => (s <= 1 ? baseSeconds : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isAvailable, baseSeconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const dotColor = isAvailable ? "bg-green-500" : "bg-amber-500";
  const textTone = isAvailable ? "text-green-700" : "text-amber-700";
  const bgTone = isAvailable ? "bg-green-50 ring-green-200" : "bg-amber-50 ring-amber-200";

  return (
    <div
      data-testid="slot-pulse"
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ring-1 ${bgTone} ${compact ? "text-[10px]" : "text-xs"} font-semibold ${textTone}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${dotColor}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
      </span>
      {isAvailable ? "Live · Available" : `Next free in ${mm}:${ss}`}
    </div>
  );
};

export default SlotPulse;
