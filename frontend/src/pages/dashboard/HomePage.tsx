import { motion } from "framer-motion";
import {
  MessageSquare,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import { kpiAPI } from "@/api/kpi";
import type {
  KpiSummary,
  KpiTimeseriesPoint,
} from "@/types/conversation.types";

/* ================= HELPERS ================= */

const formatUsd = (v = 0) => `$${v.toFixed(2)}`;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function HomePage() {
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [timeseries, setTimeseries] = useState<KpiTimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kpiAPI
      .getKpis()
      .then((res) => {
        setKpis(res.summary);
        setTimeseries(res.timeseries);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ================= LAST 7 DAYS ================= */

  const last7Days = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    return timeseries.filter(
      (p) => new Date(p.date) >= cutoff
    );
  }, [timeseries]);

  const stats = [
    {
      label: "Total Conversations",
      value: loading ? "—" : kpis?.total_conversations ?? 0,
      icon: MessageSquare,
      trend: "+12%",
      up: true,
    },
    {
      label: "Total Cost",
      value: loading
        ? "—"
        : formatUsd(kpis?.total_cost_usd ?? 0),
      icon: DollarSign,
      trend: "+8.5%",
      up: true,
    },
    {
      label: "Total Messages",
      value: loading
        ? "—"
        : kpis?.total_messages.toLocaleString() ?? "0",
      icon: Activity,
      trend: "+24%",
      up: true,
    },
    {
      label: "Avg Cost / Conv",
      value: loading
        ? "—"
        : formatUsd(kpis?.avg_cost_per_conversation_usd ?? 0),
      icon: Users,
      trend: "-2.1%",
      up: false,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard Overview
        </h1>
        <p className="text-slate-500">
          Welcome back! Here’s your activity summary.
        </p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex items-start justify-between">
              <stat.icon className="h-6 w-6 text-slate-700" />

              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.up ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.trend}
                {stat.up ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-slate-500">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ================= TOP GRAPHS ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* COST TRENDS */}
        <motion.div
          variants={item}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Cost Trends (Last 7 Days)
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={last7Days}>
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />
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
              <Tooltip formatter={(v) => formatUsd(Number(v))} />
              <Line
                type="monotone"
                dataKey="cost_usd"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* MESSAGE VOLUME */}
        <motion.div
          variants={item}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Message Volume
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={last7Days}>
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />
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
              <Tooltip />
              <Bar
                dataKey="conversations"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ================= SCROLL SECTION ================= */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Call Analytics
        </h2>

        <motion.div
          variants={item}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Avg Call Duration (seconds)
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={last7Days}>
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
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
        </motion.div>
      </div>
    </motion.div>
  );
}
