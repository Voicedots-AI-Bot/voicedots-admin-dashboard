import { motion } from "framer-motion";
import {
  MessageSquare,
  DollarSign,
  Users,
  Activity,
  Calendar,
  Clock,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { kpiAPI } from "@/api/kpi";
import type { KpiTimeseriesPoint } from "@/types/conversation.types";

import { CostOverTimeChart } from "@/components/charts/CostOverTimeChart";
import { ConversationsPerDayChart } from "@/components/charts/ConversationsPerDayChart";
import { AvgCallDurationChart } from "@/components/charts/AvgCallDurationChart";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

/* ================= TYPES & HELPERS ================= */

type Preset = "7d" | "15d" | "30d" | "all" | "custom";

const formatUsd = (v = 0) => `$${v.toFixed(2)}`;
const formatHours = (secs = 0) => `${(secs / 3600).toFixed(1)}h`;

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
    const totalDuration = data.reduce((sum, p) => sum + p.total_call_duration_secs, 0);
    const avgCost = totalConversations > 0 ? totalCost / totalConversations : 0;
    return {
      conversations: totalConversations,
      cost: totalCost,
      messages: totalMessages,
      totalDuration: totalDuration,
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
      label: "TOTAL CONVERSATIONS",
      value: loading ? "—" : currentMetrics.conversations,
      icon: MessageSquare,
      trendObj: getTrendObj("conversations"),
      color: "#000000",
      bgClass: "bg-white",
      textClass: "text-slate-900",
      ringClass: "ring-slate-200",
      dataKey: "conversations",
    },
    {
      label: "TOTAL COST",
      value: loading ? "—" : formatUsd(currentMetrics.cost),
      icon: DollarSign,
      trendObj: getTrendObj("cost"),
      color: "#000000",
      bgClass: "bg-white",
      textClass: "text-slate-900",
      ringClass: "ring-slate-200",
      dataKey: "cost_usd",
    },
    {
      label: "TOTAL MESSAGES",
      value: loading ? "—" : currentMetrics.messages.toLocaleString(),
      icon: Activity,
      trendObj: getTrendObj("messages"),
      color: "#000000",
      bgClass: "bg-white",
      textClass: "text-slate-900",
      ringClass: "ring-slate-200",
      dataKey: "messages",
    },
    {
      label: "TOTAL DURATION",
      value: loading ? "—" : formatHours(currentMetrics.totalDuration),
      icon: Clock,
      trendObj: getTrendObj("totalDuration"),
      color: "#000000",
      bgClass: "bg-white",
      textClass: "text-slate-900",
      ringClass: "ring-slate-200",
      dataKey: "total_call_duration_secs",
    },
    {
      label: "AVG COST / CONV",
      value: loading ? "—" : formatUsd(currentMetrics.avgCost),
      icon: Users,
      trendObj: getTrendObj("avgCost"),
      color: "#000000",
      bgClass: "bg-white",
      textClass: "text-slate-900",
      ringClass: "ring-slate-200",
      dataKey: "avg_cost", // specialized calculation in map
    },
  ];

  const MiniSparkline = ({ data, color }: { data: any[], color: string }) => (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#gradient-${color.replace('#','')})`}
            fillOpacity={1}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* ================= HEADER & CONTROLS ================= */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-400">
            {greeting}
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Dashboard <span className="text-blue-600">Overview</span>
            </h1>
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            Real-time analytics and performance metrics.
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 ring-1 ring-emerald-200/50">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
              LIVE
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-slate-100/50 p-1.5 ring-1 ring-slate-200/60 backdrop-blur-sm">
          <div className="flex items-center">
            {(["all", "7d", "15d", "30d"] as Preset[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePresetChange(p)}
                className={`rounded-xl px-4 py-1.5 text-[11px] font-bold tracking-wide transition-all duration-200 ${preset === p
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  : "text-slate-500 hover:bg-white hover:text-slate-900"
                  }`}
              >
                {p === "30d" ? "1M" : p === "all" ? "ALL" : p.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-300 mx-1"></div>

          <div className="flex items-center gap-2 px-2">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={from}
                onChange={(e) => handleDateChange(e.target.value, to)}
                className="bg-transparent text-[11px] font-semibold text-slate-600 outline-none focus:ring-0"
              />
            </div>
            <span className="text-slate-300 text-[10px]">→</span>
            <input
              type="date"
              value={to}
              onChange={(e) => handleDateChange(from, e.target.value)}
              className="bg-transparent text-[11px] font-semibold text-slate-600 outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="group relative overflow-hidden rounded-3xl bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] ring-1 ring-slate-200/50 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:ring-slate-300/60 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgClass} ${stat.textClass} ring-1 ${stat.ringClass}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {stat.label}
              </p>
              <div className="mt-1 flex items-end justify-between gap-2">
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>
                <div className="pb-1">
                  <MiniSparkline
                    data={filteredData.map(p => ({ 
                      value: stat.label.includes("AVG COST") 
                        ? (p.conversations > 0 ? (p.cost_usd / p.conversations) : 0) 
                        : p[stat.dataKey as keyof KpiTimeseriesPoint] 
                    }))}
                    color="#111827"
                  />
                </div>
              </div>
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
