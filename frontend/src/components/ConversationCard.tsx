import { MessageSquare, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ConversationsListSummary } from "@/types/conversation.types";

interface ConversationCardProps {
  conversation: ConversationsListSummary;
  index: number;
}

export function ConversationCard({
  conversation,
  index,
}: ConversationCardProps) {
  const navigate = useNavigate();

  const isSuccess =
    conversation.call_status === "done" ||
    conversation.call_status === "success";

  const status = isSuccess
    ? {
        label: "Successful",
        bg: "bg-green-50",
        text: "text-green-700",
      }
    : {
        label: "Unsuccessful",
        bg: "bg-red-50",
        text: "text-red-700",
      };

  return (
    <div
      onClick={() => navigate(`./${conversation.conversation_id}`)}
      className="
        cursor-pointer
        rounded-xl
        border border-gray-200
        bg-white
        px-6 py-4
        transition
        hover:bg-gray-50
      "
    >
      <div className="flex items-center justify-between gap-6">
        {/* LEFT CONTENT */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 font-medium">
              {index}.
            </span>
            <p className="truncate text-base font-semibold text-gray-900">
              {conversation.title || "Untitled Conversation"}
            </p>
          </div>

          {/* Meta */}
          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
            <span className="font-mono truncate">
              ID: {conversation.conversation_id}
            </span>

            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              {conversation.message_count}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 shrink-0">
          {/* STATUS */}
          <span
            className={`
              px-3 py-1
              rounded-full
              text-xs font-medium
              ${status.bg} ${status.text}
            `}
          >
            {status.label}
          </span>

          {/* ARROW */}
          <ChevronRight
            size={18}
            className="text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
