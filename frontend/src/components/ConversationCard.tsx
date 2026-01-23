import { MessageSquare, DollarSign, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { UI } from "@/ui/ui";

export interface Conversation {
  id: string;
  title: string;
  avatar: string;
  initials: string;
  cost: number;
  messages: number;
  status: "active" | "pending" | "completed";
  lastActive: string;
}

interface ConversationCardProps {
  conversation: Conversation;
  index: number;
}

export function ConversationCard({
  conversation,
  index,
}: ConversationCardProps) {
  const statusColor =
    conversation.status === "active"
      ? UI.colors.success
      : conversation.status === "pending"
      ? UI.colors.warning
      : UI.colors.text.muted;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, translateY: -5 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 backdrop-blur-xl transition-all"
      style={{
        background: UI.colors.surface.glassSm,
        border: `1px solid ${UI.colors.border.strong}`,
        boxShadow: UI.colors.shadow.sm,
      }}
    >
      {/* Decorative glow */}
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all"
        style={{ background: UI.colors.glow.purple }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
              <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                background: UI.colors.surface.glassLg,
                border: `2px solid ${UI.colors.border.glass}`,
              }}
            >
              <span
                className="text-lg font-bold"
                style={{ color: UI.colors.accent }}
              >
                {conversation.initials}
              </span>
            </div>

            <div>
              <h3
                className="font-semibold line-clamp-1"
                style={{ color: UI.colors.text.primary }}
              >
                {conversation.title}
              </h3>
              <p
                className="text-xs font-medium"
                style={{ color: UI.colors.text.muted }}
              >
                {conversation.lastActive}
              </p>
            </div>
          </div>

          <button
            className="rounded-full p-1 transition-colors"
            style={{ color: UI.colors.text.muted }}
          >
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Cost Meter */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span
              className="flex items-center gap-1 font-medium"
              style={{ color: UI.colors.text.secondary }}
            >
              <DollarSign size={14} /> Cost
            </span>
            <span
              className="font-bold"
              style={{ color: UI.colors.text.primary }}
            >
              ${conversation.cost}
            </span>
          </div>

          <div
            className="h-2 w-full overflow-hidden rounded-full p-[1px]"
            style={{ background: UI.colors.surface.glassXs }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${conversation.cost}%` }}
              transition={{
                duration: 1,
                delay: 0.5 + index * 0.1,
                ease: "easeOut",
              }}
              className="h-full rounded-full"
              style={{
                backgroundImage: UI.colors.gradient.accent,
                boxShadow: "0 0 10px rgba(124, 58, 237, 0.5)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="relative z-10 flex items-center justify-between pt-4"
        style={{ borderTop: `1px solid ${UI.colors.border.subtle}` }}
      >
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: UI.colors.surface.glassSm,
            color: UI.colors.accent,
            border: `1px solid ${UI.colors.border.glass}`,
          }}
        >
          <MessageSquare size={14} />
          {conversation.messages} msgs
        </div>

        <div
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: statusColor }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: statusColor,
              boxShadow:
                conversation.status === "active"
                  ? "0 0 8px rgba(34,197,94,0.6)"
                  : undefined,
            }}
          />
          {conversation.status.charAt(0).toUpperCase() +
            conversation.status.slice(1)}
        </div>
      </div>
    </motion.div>
  );
}
