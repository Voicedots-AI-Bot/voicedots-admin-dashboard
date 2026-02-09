import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { KpiTimeseriesPoint } from "@/types/conversation.types";

interface Props {
  data: KpiTimeseriesPoint[];
}

export function CostOverTimeChart({ data }: Props) {
  // get date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // includes today

  const last7DaysData = data.filter((point) => {
    const pointDate = new Date(point.date);
    return pointDate >= sevenDaysAgo;
  });

  return (
    <div className="h-[300px] w-full rounded-2xl p-4 bg-white/5">
      <h3 className="mb-4 text-sm font-semibold">
        Cost Over Time (Last 7 Days)
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={last7DaysData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="cost_usd"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
