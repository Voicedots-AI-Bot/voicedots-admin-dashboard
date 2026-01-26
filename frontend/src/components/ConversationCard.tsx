import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UI } from "@/ui/ui";
import type { ConversationSummary } from "@/types/conversation.types";

interface ConversationCardProps {
  conversation: ConversationSummary;
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const navigate = useNavigate();
  const isSuccess = conversation.status === "done" || conversation.status === "success";
  
  const statusStyle = isSuccess
      ? {
          label: "Successful",
          bg: "rgba(34,197,94,0.15)",
          text: "#16a34a",
        }
      : {
          label: "Error",
          bg: "rgba(239,68,68,0.15)",
          text: "#dc2626",
        };

  return (
    <div
      onClick={() => navigate(`./${conversation.conversation_id}`)}
      className="cursor-pointer rounded-2xl px-4 sm:px-6 py-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px]"
      style={{
        background: UI.colors.surface.glassSm,
        border: `1px solid ${UI.colors.border.glass}`,
      }}
    >
      <div className="flex items-center justify-between">
        {/* LEFT SECTION */}
        <div className="min-w-0 pr-6">
          <p
            className="truncate text-base font-semibold"
            style={{ color: UI.colors.text.primary }}
          >
            {conversation.call_summary_title ?? "Untitled Conversation"}
          </p>
          <p
            className="text-sm truncate mt-1"
            style={{ color: UI.colors.text.muted }}
          >
            ID: {conversation.conversation_id}
          </p>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-1 text-sm"
            style={{ color: UI.colors.text.secondary }}
          >
            <MessageSquare size={16} />
            {conversation.message_count}
          </div>

          <span
            className="rounded-full px-4 py-1 text-xs font-medium text-center"
            style={{
              background: statusStyle.bg,
              color: statusStyle.text,
              minWidth: "100px",
            }}
          >
            {statusStyle.label}
          </span>
        </div>
      </div>
    </div>
  );
}