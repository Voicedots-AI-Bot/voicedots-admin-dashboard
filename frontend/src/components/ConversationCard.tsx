import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Conversation } from "@/utils/mockData";
import { UI } from "@/ui/ui";

interface Props {
  conversation: Conversation;
}

export function ConversationCard({ conversation }: Props) {
  const navigate = useNavigate();

  const statusStyle =
    conversation.status === "successful"
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
      onClick={() => navigate(`./${conversation.id}`)}
      className="
        cursor-pointer
        rounded-2xl
        px-4 sm:px-6
        py-4
        transition-all duration-200
        hover:shadow-lg hover:-translate-y-[1px]
      "
      style={{
        background: UI.colors.surface.glassSm,
        border: `1px solid ${UI.colors.border.glass}`,
      }}
    >
      {/* MOBILE */}
      <div className="flex flex-col gap-3 md:hidden">
        <div>
          <p
            className="truncate text-base font-semibold"
            style={{ color: UI.colors.text.primary }}
          >
            {conversation.title}
          </p>
          <p
            className="text-sm truncate mt-1"
            style={{ color: UI.colors.text.muted }}
          >
            {conversation.lastActive} · ID: #{conversation.id}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-1 text-sm"
            style={{ color: UI.colors.text.secondary }}
          >
            <MessageSquare size={16} />
            {conversation.messages}
          </div>

          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: statusStyle.bg,
              color: statusStyle.text,
            }}
          >
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:flex items-center justify-between">
        {/* LEFT */}
        <div className="min-w-0 pr-6">
          <p
            className="truncate text-base font-semibold"
            style={{ color: UI.colors.text.primary }}
          >
            {conversation.title}
          </p>
          <p
            className="text-sm truncate mt-1"
            style={{ color: UI.colors.text.muted }}
          >
            {conversation.lastActive} · ID: #{conversation.id}
          </p>
        </div>

        {/* RIGHT */}
        <div
          className="grid items-center gap-6"
          style={{ gridTemplateColumns: "60px 70px 110px" }}
        >
          <div
            className="flex items-center gap-1 justify-end text-sm"
            style={{ color: UI.colors.text.secondary }}
          >
            <MessageSquare size={16} />
            {conversation.messages}
          </div>

          <div
            className="text-sm font-medium text-right"
            style={{ color: UI.colors.text.primary }}
          >
            ${conversation.cost.toFixed(2)}
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
