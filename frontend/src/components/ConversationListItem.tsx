import { motion } from "framer-motion";
import {
  MessageSquare,
  DollarSign,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { Conversation } from "@/utils/mockData";
import { UI } from "@/ui/ui";

interface ConversationListItemProps {
  conversation: Conversation;
  index: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export function ConversationListItem({
  conversation,
  index,
  onClick,
  isSelected,
}: ConversationListItemProps) {
  const statusStyle = {
    active: {
      bg: UI.colors.surface.glassSm,
      color: UI.colors.success,
      border: UI.colors.success,
    },
    pending: {
      bg: UI.colors.surface.glassSm,
      color: UI.colors.warning,
      border: UI.colors.warning,
    },
    completed: {
      bg: UI.colors.surface.glassSm,
      color: UI.colors.text.muted,
      border: UI.colors.text.muted,
    },
  }[conversation.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{
        scale: 1.01,
        background: UI.colors.surface.glassMd,
      }}
      onClick={onClick}
      className="group relative flex items-center gap-4 rounded-xl backdrop-blur-md transition-all cursor-pointer"
      style={{
        background: isSelected
          ? UI.colors.surface.glassMd
          : UI.colors.surface.glassSm,
        border: `1px solid ${
          isSelected ? UI.colors.accent : UI.colors.border.strong
        }`,
        boxShadow: isSelected
          ? UI.colors.shadow.sm
          : "none",
      }}
    >
      <div className="flex items-center gap-4 p-4 flex-1 min-w-0">
        {/* Avatar */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold"
          style={{
            backgroundImage: UI.colors.gradient.accent,
            color: UI.colors.text.inverse,
            boxShadow: UI.colors.shadow.sm,
          }}
        >
          {conversation.initials}
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="truncate font-semibold"
            style={{ color: UI.colors.text.primary }}
          >
            {conversation.title}
          </h3>

          <div
            className="flex items-center gap-3 text-xs mt-1"
            style={{ color: UI.colors.text.muted }}
          >
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {conversation.lastActive}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1">
              ID: #{conversation.id}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 mr-4">
          <div className="flex flex-col items-end">
            <span
              className="text-xs"
              style={{ color: UI.colors.text.muted }}
            >
              Messages
            </span>
            <div
              className="flex items-center gap-1 font-medium"
              style={{ color: UI.colors.text.secondary }}
            >
              <MessageSquare size={14} />
              {conversation.messages}
            </div>
          </div>

          <div className="flex flex-col items-end w-20">
            <span
              className="text-xs"
              style={{ color: UI.colors.text.muted }}
            >
              Cost
            </span>
            <div
              className="flex items-center gap-1 font-bold"
              style={{ color: UI.colors.text.primary }}
            >
              <DollarSign size={14} />
              {conversation.cost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Status */}
        <div
          className="hidden sm:flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            background: statusStyle.bg,
            color: statusStyle.color,
            border: `1px solid ${statusStyle.border}`,
          }}
        >
          {conversation.status.charAt(0).toUpperCase() +
            conversation.status.slice(1)}
        </div>

        {/* Arrow */}
        <div
          className="transition-transform group-hover:translate-x-1"
          style={{ color: UI.colors.accent }}
        >
          <ChevronRight size={20} />
        </div>
      </div>
    </motion.div>
  );
}
