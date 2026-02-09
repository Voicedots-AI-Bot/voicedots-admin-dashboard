import { motion } from "framer-motion";
import {
  MessageSquare,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { kpiAPI } from "@/api/kpi";
import type {
  KpiSummary,
  KpiTimeseriesPoint,
} from "@/types/conversation.types";

import { CostOverTimeChart } from "@/components/charts/CostOverTimeChart";
import { ConversationsPerDayChart } from "@/components/charts/ConversationsPerDayChart";
import { AvgCallDurationChart } from "@/components/charts/AvgCallDurationChart";

/* ================= TYPES & HELPERS ================= */

type Preset = "7d" | "15d" | "30d" | "custom";

const formatUsd = (v = 0) => `$${v.toFixed(2)}`;

const getRangeFromPreset = (preset: Preset) => {
  const end = new Date();
  const start = new Date();

  if (preset === "7d") start.setDate(end.getDate() - 6);
  if (preset === "15d") start.setDate(end.getDate() - 14);
  if (preset === "30d") start.setDate(end.getDate() - 29);

  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

/* ================= HOME PAGE ================= */

export function HomePage() {
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [timeseries, setTimeseries] = useState<KpiTimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  /* ===== GLOBAL DATE RANGE ===== */
  const [preset, setPreset] = useState<Preset>("7d");
  const [{ from, to }, setRange] = useState(() =>
    getRangeFromPreset("7d")
  );

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

  const handlePresetChange = (p: Preset) => {
    setPreset(p);
    if (p !== "custom") {
      setRange(getRangeFromPreset(p));
    }
  };

  const handleDateChange = (f: string, t: string) => {
    setPreset("custom");
    setRange({ from: f, to: t });
  };

  /* ===== FILTER DATA ONCE ===== */
const filteredData = useMemo(() => {
  return timeseries
    .filter((p) => {
      const d = new Date(p.date).toISOString().slice(0, 10);
      return d >= from && d <= to;
    })
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    ); // 👈 IMPORTANT
}, [timeseries, from, to]);

  /* ===== KPI CARDS ===== */
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
      className="space-y-10"
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

      {/* ================= ANALYTICS CONTROLS ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Analytics
        </h2>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          {(["7d", "15d", "30d"] as Preset[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePresetChange(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                preset === p
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p === "30d" ? "1M" : p.toUpperCase()}
            </button>
          ))}

          <Calendar size={14} className="text-slate-500" />

          <input
            type="date"
            value={from}
            onChange={(e) =>
              handleDateChange(e.target.value, to)
            }
            className="rounded-md border border-slate-200 px-2 py-1 text-xs"
          />

          <input
            type="date"
            value={to}
            onChange={(e) =>
              handleDateChange(from, e.target.value)
            }
            className="rounded-md border border-slate-200 px-2 py-1 text-xs"
          />
        </div>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CostOverTimeChart data={filteredData} />
        <ConversationsPerDayChart data={filteredData} />
      </div>

      <AvgCallDurationChart data={filteredData} />
    </motion.div>
  );
}
