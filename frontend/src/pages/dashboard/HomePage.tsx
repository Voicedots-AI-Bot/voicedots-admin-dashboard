import { motion } from "framer-motion";
import {
  MessageSquare,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useEffect, useState } from "react";

import conversationsApi from "@/api/conversations";
import type { KpiSummary } from "@/types/conversation.types";
// import { ANALYTICS_DATA } from "@/utils/mockData";
import { UI } from "@/ui/colors";

export function HomePage() {
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    conversationsApi
      .getKpiSummary()
      .then(setKpis)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const stats = [
    {
      label: "Total Conversations",
      value: loading ? "—" : kpis?.total_conversations ?? 0,
      icon: MessageSquare,
      iconBg: UI.colors.surface.glassSm,
      iconColor: UI.colors.accent,
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Total Cost",
      value: loading
        ? "—"
        : `$${kpis?.total_cost_usd.toFixed(2) ?? "0.00"}`,
      icon: DollarSign,
      iconBg: UI.colors.surface.glassSm,
      iconColor: UI.colors.success,
      trend: "+8.5%",
      trendUp: true,
    },
    {
      label: "Total Messages",
      value: loading
        ? "—"
        : kpis?.total_messages.toLocaleString() ?? "0",
      icon: Activity,
      iconBg: UI.colors.surface.glassSm,
      iconColor: UI.colors.accent,
      trend: "+24%",
      trendUp: true,
    },
    {
      label: "Avg. Cost / Conv",
      value: loading
        ? "—"
        : `$${kpis?.avg_cost_per_conversation.toFixed(2) ?? "0.00"}`,
      icon: Users,
      iconBg: UI.colors.surface.glassSm,
      iconColor: UI.colors.warning,
      trend: "-2.1%",
      trendUp: false,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ color: UI.colors.text.primary }}
        >
          Dashboard Overview
        </h1>
        <p
          className="mt-1"
          style={{ color: UI.colors.text.secondary }}
        >
          Welcome back! Here's your activity summary.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="group relative overflow-hidden rounded-2xl p-6 backdrop-blur-md transition-all"
            style={{
              background: UI.colors.surface.glassSm,
              border: `1px solid ${UI.colors.border.strong}`,
              boxShadow: UI.colors.shadow.sm,
            }}
          >
            <div className="flex items-start justify-between">
              <div
                className="rounded-xl p-3"
                style={{ background: stat.iconBg }}
              >
                <stat.icon
                  className="h-6 w-6"
                  style={{ color: stat.iconColor }}
                />
              </div>

              <div
                className="flex items-center gap-1 text-xs font-medium"
                style={{
                  color: stat.trendUp
                    ? UI.colors.success
                    : UI.colors.danger,
                }}
              >
                {stat.trend}
                {stat.trendUp ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
              </div>
            </div>

            <div className="mt-4">
              <p
                className="text-sm font-medium"
                style={{ color: UI.colors.text.muted }}
              >
                {stat.label}
              </p>
              <p
                className="mt-1 text-2xl font-bold"
                style={{ color: UI.colors.text.primary }}
              >
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}
