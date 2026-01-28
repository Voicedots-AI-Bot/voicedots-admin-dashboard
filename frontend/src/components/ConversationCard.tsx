import { MessageSquare, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UI } from "@/ui/colors";
import type { ConversationSummary } from "@/types/conversation.types";

interface ConversationCardProps {
  conversation: ConversationSummary;
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const navigate = useNavigate();

  const isSuccess =
    conversation.status === "done" || conversation.status === "success";

  const statusStyle = isSuccess
    ? {
        label: "Successful",
        bg: "rgba(34,197,94,0.15)",
        text: "#16a34a",
        accent: "#22c55e",
      }
    : {
        label: "Error",
        bg: "rgba(239,68,68,0.15)",
        text: "#dc2626",
        accent: "#ef4444",
      };

  return (
    <div
      onClick={() => navigate(`./${conversation.conversation_id}`)}
      className="
        group cursor-pointer
        rounded-2xl px-5 py-4
        transition-all duration-200
        hover:-translate-y-[1px]
      "
      style={{
        background: `
          linear-gradient(
            180deg,
            rgba(255,255,255,0.95),
            rgba(255,255,255,0.85)
          )
        `,
        boxShadow: `
          inset 0 0 0 1px rgba(0,0,0,0.05),
          0 8px 24px rgba(0,0,0,0.06)
        `,
      }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* LEFT CONTENT */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[15px] font-semibold tracking-tight"
            style={{ color: UI.colors.text.primary }}
          >
            {conversation.call_summary_title ?? "Untitled Conversation"}
          </p>

          <p
            className="mt-1 text-xs font-mono truncate"
            style={{ color: UI.colors.text.muted }}
          >
            ID: {conversation.conversation_id}
          </p>
        </div>

        {/* RIGHT METADATA */}
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-1 text-sm"
            style={{ color: UI.colors.text.secondary }}
          >
            <MessageSquare size={15} />
            {conversation.message_count}
          </div>

          <span
            className="rounded-full px-4 py-1 text-xs font-medium"
            style={{
              background: statusStyle.bg,
              color: statusStyle.text,
            }}
          >
            {statusStyle.label}
          </span>

          <ChevronRight
            size={18}
            className="opacity-40 transition group-hover:opacity-70"
            style={{ color: UI.colors.text.muted }}
          />
        </div>
      </div>
    </div>
  );
}
