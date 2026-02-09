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

interface Props {
  data: KpiTimeseriesPoint[];
}

export function ConversationsPerDayChart({ data }: Props) {
  return (
    <div className="h-72 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Message Volume
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#64748b",
              fontSize: 12,
            }}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("en-IN", {
                weekday: "short",
              })
            }
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#64748b",
              fontSize: 12,
            }}
          />

          <Tooltip
            contentStyle={{
              background: "#ffffff",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            formatter={(v) => [v, "Messages"]}
          />

          <Bar
            dataKey="conversations"
            radius={[6, 6, 0, 0]}
            fill="#6366f1" // same indigo family as other charts
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
