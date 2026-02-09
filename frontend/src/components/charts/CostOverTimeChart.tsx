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

interface Props {
  data: KpiTimeseriesPoint[];
}

export function CostOverTimeChart({ data }: Props) {
  return (
    <div className="h-[300px] w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Cost Trends
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("en-IN", {
                weekday: "short",
              })
            }
          />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip
            formatter={(v) => [
              `$${Number(v).toFixed(2)}`,
              "Cost",
            ]}
          />
          <Line
            type="monotone"
            dataKey="cost_usd"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
