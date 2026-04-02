import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { KpiTimeseriesPoint } from "@/types/conversation.types";
import { useMemo } from "react";

interface Props {
  data: KpiTimeseriesPoint[];
}

export function AvgCallDurationChart({ data }: Props) {
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const stats = useMemo(() => {
    const total = data.reduce((sum, p) => sum + p.avg_call_duration_secs, 0);
    const avg = data.length > 0 ? total / data.length : 0;
    const peak = data.reduce((max, p) => Math.max(max, p.avg_call_duration_secs), 0);
    return { avg, peak };
  }, [data]);

  return (
    <div className="group relative flex flex-col rounded-[24px] bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] ring-1 ring-slate-100 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:ring-slate-200">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            <h3 className="text-[14px] font-bold tracking-tight text-slate-900">Call Duration</h3>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">Average call duration over time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-2xl bg-[#fffbeb] px-3 py-1.5 ring-1 ring-amber-100">
             <span className="text-[10px] font-bold uppercase tracking-tight text-amber-500">Avg</span>
             <span className="text-[15px] font-black text-[#d97706]">{formatDuration(stats.avg)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[#ecfdf5] px-3 py-1.5 ring-1 ring-emerald-100">
              <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-500">Peak</span>
              <span className="text-[15px] font-black text-emerald-700">{formatDuration(stats.peak)}</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }}
              dy={15}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }}
              tickFormatter={(v) => `${Math.round(v)}s`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                fontSize: "11px",
                fontWeight: "900"
              }}
              formatter={(v) => [formatDuration(Number(v)), "Avg Duration"]}
            />
            <Area
              type="monotone"
              dataKey="avg_call_duration_secs"
              stroke="#ea580c"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#durationGradient)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
