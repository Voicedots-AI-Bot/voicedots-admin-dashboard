import {
  BarChart,
  Bar,
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

export function ConversationsPerDayChart({ data }: Props) {
  const stats = useMemo(() => {
    const total = data.reduce((sum, p) => sum + p.messages, 0);
    const avg = data.length > 0 ? total / data.length : 0;
    
    let peakVal = 0;
    let peakDate = "";
    data.forEach(p => {
      if (p.messages > peakVal) {
        peakVal = p.messages;
        peakDate = new Date(p.date).toLocaleDateString("en-US", { weekday: "short" });
      }
    });

    return { total, avg, peakVal, peakDate };
  }, [data]);

  return (
    <div className="group relative flex flex-col rounded-[24px] bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] ring-1 ring-slate-100 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:ring-slate-200">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <h3 className="text-[14px] font-bold tracking-tight text-slate-900">Message Volume</h3>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">Daily message volume</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-2xl bg-[#eff6ff] px-3 py-1.5 ring-1 ring-blue-100">
            <span className="text-[10px] font-bold uppercase tracking-tight text-blue-400">Total</span>
            <span className="text-[15px] font-black text-blue-700">{stats.total}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[#f5f3ff] px-3 py-1.5 ring-1 ring-indigo-100">
            <span className="text-[10px] font-bold uppercase tracking-tight text-indigo-400">Avg/Day</span>
            <span className="text-[15px] font-black text-indigo-600">{stats.avg.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[#ecfdf5] px-3 py-1.5 ring-1 ring-emerald-100">
             <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-400">Peak</span>
                <span className="text-[9px] font-bold text-emerald-300">({stats.peakDate})</span>
             </div>
             <span className="text-[15px] font-black text-emerald-600">{stats.peakVal}</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barCategoryGap="8%"
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              dy={15}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("en-IN", {
                  weekday: "short",
                })
              }
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(211, 211, 211, 0.4)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-md">
                      <p className="mb-1 text-[12px] font-medium text-[#64748b]">
                        {new Date(payload[0].payload.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                      <p className="text-[12px] font-bold text-[#6366f1]">
                        Messages : {payload[0].value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="messages"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              maxBarSize={100}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
