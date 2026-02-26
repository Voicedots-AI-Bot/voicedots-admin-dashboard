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

type Preset = "7d" | "15d" | "30d" | "all" | "custom";

const formatUsd = (v = 0) => `$${v.toFixed(2)}`;

const getRangeFromPreset = (preset: Preset) => {
  const end = new Date();
  const start = new Date();

  if (preset === "all") {
    start.setFullYear(2000);
  } else if (preset === "7d") {
    start.setDate(end.getDate() - 6);
  } else if (preset === "15d") {
    start.setDate(end.getDate() - 14);
  } else if (preset === "30d") {
    start.setDate(end.getDate() - 29);
  }

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
  const [preset, setPreset] = useState<Preset>("all");
  const [{ from, to }, setRange] = useState(() =>
    getRangeFromPreset("all")
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

  const previousFilteredData = useMemo(() => {
    if (preset === "all") return [];

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const durationDays = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const prevToDate = new Date(fromDate);
    prevToDate.setDate(prevToDate.getDate() - 1);

    const prevFromDate = new Date(prevToDate);
    prevFromDate.setDate(prevFromDate.getDate() - durationDays + 1);

    const prevFrom = prevFromDate.toISOString().slice(0, 10);
    const prevTo = prevToDate.toISOString().slice(0, 10);

    return timeseries.filter((p) => {
      const d = new Date(p.date).toISOString().slice(0, 10);
      return d >= prevFrom && d <= prevTo;
    });
  }, [timeseries, from, to, preset]);

  const computeMetrics = (data: KpiTimeseriesPoint[]) => {
    const totalConversations = data.reduce((sum, p) => sum + p.conversations, 0);
    const totalCost = data.reduce((sum, p) => sum + p.cost_usd, 0);
    const totalMessages = data.reduce((sum, p) => sum + p.messages, 0);
    const avgCost = totalConversations > 0 ? totalCost / totalConversations : 0;
    return {
      conversations: totalConversations,
      cost: totalCost,
      messages: totalMessages,
      avgCost: avgCost
    };
  };

  const currentMetrics = useMemo(() => computeMetrics(filteredData), [filteredData]);
  const previousMetrics = useMemo(() => computeMetrics(previousFilteredData), [previousFilteredData]);

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { text: current > 0 ? "+100%" : "0%", up: current >= 0 };
    const diff = ((current - previous) / previous) * 100;
    return {
      text: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`,
      up: diff >= 0,
    };
  };

  const getTrendObj = (key: keyof ReturnType<typeof computeMetrics>) => {
    if (preset === "all") return null;
    return calculateTrend(currentMetrics[key], previousMetrics[key]);
  };

  /* ===== KPI CARDS ===== */
  const stats = [
    {
      label: "Total Conversations",
      value: loading ? "—" : (preset === "all" ? kpis?.total_conversations ?? 0 : currentMetrics.conversations),
      icon: MessageSquare,
      trendObj: getTrendObj("conversations"),
    },
    {
      label: "Total Cost",
      value: loading
        ? "—"
        : formatUsd(preset === "all" ? kpis?.total_cost_usd ?? 0 : currentMetrics.cost),
      icon: DollarSign,
      trendObj: getTrendObj("cost"),
    },
    {
      label: "Total Messages",
      value: loading
        ? "—"
        : (preset === "all" ? kpis?.total_messages ?? 0 : currentMetrics.messages).toLocaleString(),
      icon: Activity,
      trendObj: getTrendObj("messages"),
    },
    {
      label: "Avg Cost / Conv",
      value: loading
        ? "—"
        : formatUsd(preset === "all" ? kpis?.avg_cost_per_conversation_usd ?? 0 : currentMetrics.avgCost),
      icon: Users,
      trendObj: getTrendObj("avgCost"),
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* ================= HEADER & CONTROLS ================= */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-slate-500">
            Welcome back! Here’s your activity summary.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          {(["all", "7d", "15d", "30d"] as Preset[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePresetChange(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${preset === p
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {p === "30d" ? "1M" : p === "all" ? "ALL" : p.toUpperCase()}
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
              {stat.trendObj && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${stat.trendObj.up ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {stat.trendObj.text}
                  {stat.trendObj.up ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                </div>
              )}
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

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CostOverTimeChart data={filteredData} />
        <ConversationsPerDayChart data={filteredData} />
      </div>

      <AvgCallDurationChart data={filteredData} />
    </motion.div>
  );
}
