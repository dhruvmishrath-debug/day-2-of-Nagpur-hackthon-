const TimeBreakdown = ({ travel = 0, wait = 0, charge = 0 }) => {
  const total = Math.max(travel + wait + charge, 1);
  const pct = (v) => (v / total) * 100;
  return (
    <div data-testid="time-breakdown" className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-500">Total estimated time</p>
        <p className="font-['Outfit'] text-sm font-semibold text-stone-900">{Math.round(total)} min</p>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-stone-100">
        <div className="bg-stone-400" style={{ width: `${pct(travel)}%` }} />
        <div className="bg-amber-400" style={{ width: `${pct(wait)}%` }} />
        <div className="bg-green-600" style={{ width: `${pct(charge)}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600">
        <Legend color="bg-stone-400" label="Travel" val={travel} />
        <Legend color="bg-amber-400" label="Wait" val={wait} />
        <Legend color="bg-green-600" label="Charge" val={charge} />
      </div>
    </div>
  );
};

const Legend = ({ color, label, val }) => (
  <span className="flex items-center gap-1.5">
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
    <span className="font-medium">{label}</span>
    <span className="text-stone-500">{Math.round(val)} min</span>
  </span>
);

export default TimeBreakdown;
