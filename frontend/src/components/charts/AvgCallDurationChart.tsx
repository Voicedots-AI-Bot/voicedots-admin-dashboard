import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { KpiTimeseriesPoint } from "@/types/conversation.types";

export function AvgCallDurationChart({
  data,
}: {
  data: KpiTimeseriesPoint[];
}) {
  return (
    <div className="h-72 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Avg Call Duration (seconds)
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="avg_call_duration_secs"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
