import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { fetchAnalytics } from "@/lib/api";

const COLORS = ["#16a34a", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ef4444"];

const AnalyticsWidget = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => { fetchAnalytics().then(setStats).catch(() => setStats(null)); }, []);

  if (!stats) return <div className="rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-500">Loading analytics…</div>;

  const tod = Object.entries(stats.sessions_by_time_of_day || {}).map(([k, v]) => ({ name: k, value: v }));
  const chargers = Object.entries(stats.charger_type_distribution || {}).map(([k, v]) => ({ name: k, value: v }));
  const rates = Object.entries(stats.avg_rate_by_charger || {}).map(([k, v]) => ({ name: k, value: v }));

  const items = [
    { k: stats.total_sessions, l: "Total sessions" },
    { k: `${stats.avg_duration_hours}h`, l: "Avg duration" },
    { k: `${stats.avg_energy_kwh} kWh`, l: "Avg energy" },
    { k: `$${stats.avg_cost_usd}`, l: "Avg cost" },
  ];

  return (
    <div data-testid="analytics-widget" className="grid gap-4 lg:grid-cols-3">
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        {items.map((x, i) => (
          <div key={i} className="rounded-xl bg-stone-50 p-4">
            <p className="font-['Outfit'] text-2xl font-bold text-stone-900">{x.k}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">{x.l}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-2">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Sessions by time of day</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tod}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="name" stroke="#78716c" fontSize={12} />
              <YAxis stroke="#78716c" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4" }} />
              <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Charger type distribution</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chargers} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                {chargers.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-2">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Average rate (kW) by charger type</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rates}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="name" stroke="#78716c" fontSize={12} />
              <YAxis stroke="#78716c" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4" }} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
