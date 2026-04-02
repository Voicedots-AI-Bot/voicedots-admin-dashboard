import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { KpiTimeseriesPoint } from "@/types/conversation.types";
import { useMemo } from "react";

interface Props {
  data: KpiTimeseriesPoint[];
}

export function CostOverTimeChart({ data }: Props) {
  const totalCost = useMemo(() => data.reduce((sum, p) => sum + p.cost_usd, 0), [data]);
  
  // Trend calculation
  const trend = useMemo(() => {
    if (data.length < 2) return { value: "+0.0%", up: true };
    const mid = Math.floor(data.length / 2);
    const firstHalfSum = data.slice(0, mid).reduce((sum, p) => sum + p.cost_usd, 0);
    const secondHalfSum = data.slice(mid).reduce((sum, p) => sum + p.cost_usd, 0);
    
    if (firstHalfSum === 0) {
        return { value: secondHalfSum > 0 ? "+100%" : "0.0%", up: secondHalfSum > 0 };
    }
    
    const diff = ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100;
    return {
      value: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`,
      up: diff >= 0,
    };
  }, [data]);

  return (
    <div className="group relative flex flex-col rounded-[24px] bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] ring-1 ring-slate-100 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:ring-slate-200">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
            <h3 className="text-[14px] font-bold tracking-tight text-slate-900">Cost Trends</h3>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">Spending over time</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-2xl bg-[#eff6ff] px-3 py-1.5 ring-1 ring-blue-100">
             <span className="text-[10px] font-bold uppercase tracking-tight text-blue-400">Total</span>
             <span className="text-[15px] font-black text-blue-700">${totalCost.toFixed(2)}</span>
          </div>
          <div className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 ring-1 ${
            trend.up 
              ? "bg-[#ecfdf5] ring-emerald-100" 
              : "bg-[#fef2f2] ring-red-100"
          }`}>
            {trend.up ? (
              <TrendingUp size={16} className="text-emerald-500" />
            ) : (
              <TrendingDown size={16} className="text-red-500" />
            )}
            <span className={`text-[15px] font-black tracking-tight ${
              trend.up ? "text-emerald-600" : "text-red-600"
            }`}>
              {trend.value}
            </span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="costTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
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
              tickFormatter={(v) => `$${v}`}
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
            />
            <Area
              type="monotone"
              dataKey="cost_usd"
              stroke="#4f46e5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#costTrendGradient)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
