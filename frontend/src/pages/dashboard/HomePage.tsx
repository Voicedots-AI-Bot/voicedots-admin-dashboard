import { motion } from "framer-motion";
import {
  MessageSquare,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { ANALYTICS_DATA, MOCK_CONVERSATIONS } from "@/utils/mockData";
import { ConversationListItem } from "@/components/ConversationListItem";
import { UI } from "@/ui/ui";

export function HomePage() {
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
      value: ANALYTICS_DATA.totalConversations,
      icon: MessageSquare,
      iconBg: UI.colors.surface.glassSm,
      iconColor: UI.colors.accent,
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Total Cost",
      value: `$${ANALYTICS_DATA.totalCost.toLocaleString()}`,
      icon: DollarSign,
      iconBg: UI.colors.surface.glassSm,
      iconColor: UI.colors.success,
      trend: "+8.5%",
      trendUp: true,
    },
    {
      label: "Total Messages",
      value: ANALYTICS_DATA.totalMessages.toLocaleString(),
      icon: Activity,
      iconBg: UI.colors.surface.glassSm,
      iconColor: UI.colors.accent,
      trend: "+24%",
      trendUp: true,
    },
    {
      label: "Avg. Cost / Conv",
      value: `$${ANALYTICS_DATA.avgCost}`,
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

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cost Chart */}
        <motion.div
          variants={item}
          className="rounded-2xl p-6 backdrop-blur-md"
          style={{
            background: UI.colors.surface.glassSm,
            border: `1px solid ${UI.colors.border.strong}`,
          }}
        >
          <h3
            className="mb-6 text-lg font-bold"
            style={{ color: UI.colors.text.primary }}
          >
            Cost Trends (Last 7 Days)
          </h3>

          <div className="flex h-64 items-end gap-2 sm:gap-4">
            {ANALYTICS_DATA.costHistory.map((data, i) => (
              <div
                key={data.day}
                className="group relative flex h-full flex-1 flex-col justify-end"
              >
                <div
                  className="relative w-full overflow-hidden rounded-t-lg"
                  style={{ background: UI.colors.surface.glassMd }}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(data.cost / 250) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="absolute bottom-0 w-full opacity-80"
                    style={{
                      backgroundImage: UI.colors.gradient.accent,
                    }}
                  />
                </div>

                <span
                  className="mt-2 text-center text-xs font-medium"
                  style={{ color: UI.colors.text.muted }}
                >
                  {data.day}
                </span>

                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div
                    className="rounded-lg px-2 py-1 text-xs"
                    style={{
                      background: UI.colors.primary,
                      color: UI.colors.text.inverse,
                    }}
                  >
                    ${data.cost}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Message Chart */}
        <motion.div
          variants={item}
          className="rounded-2xl p-6 backdrop-blur-md"
          style={{
            background: UI.colors.surface.glassSm,
            border: `1px solid ${UI.colors.border.strong}`,
          }}
        >
          <h3
            className="mb-6 text-lg font-bold"
            style={{ color: UI.colors.text.primary }}
          >
            Message Volume
          </h3>

          <div className="flex h-64 items-end gap-2 sm:gap-4">
            {ANALYTICS_DATA.messageVolume.map((data, i) => (
              <div
                key={data.day}
                className="group relative flex h-full flex-1 flex-col justify-end"
              >
                <div
                  className="relative w-full overflow-hidden rounded-t-lg"
                  style={{ background: UI.colors.surface.glassMd }}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(data.messages / 600) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="absolute bottom-0 w-full opacity-80"
                    style={{
                      background:
                        "linear-gradient(to top, #22c55e, #14b8a6)",
                    }}
                  />
                </div>

                <span
                  className="mt-2 text-center text-xs font-medium"
                  style={{ color: UI.colors.text.muted }}
                >
                  {data.day}
                </span>

                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div
                    className="rounded-lg px-2 py-1 text-xs"
                    style={{
                      background: UI.colors.primary,
                      color: UI.colors.text.inverse,
                    }}
                  >
                    {data.messages} msgs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Conversations */}
      <motion.div variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <h3
            className="text-lg font-bold"
            style={{ color: UI.colors.text.primary }}
          >
            Recent Conversations
          </h3>
          <button
            className="text-sm font-medium transition-colors"
            style={{ color: UI.colors.accent }}
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {MOCK_CONVERSATIONS.slice(0, 4).map((conversation, index) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
