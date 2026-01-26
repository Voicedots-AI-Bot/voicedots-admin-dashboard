import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from "@/utils/mockData";

export function ConversationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const conversation = MOCK_CONVERSATIONS.find((c) => c.id === id);
  const messages = MOCK_MESSAGES.filter(
    (m) => m.conversationId === id
  );

  if (!conversation) {
    return <div>Conversation not found</div>;
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* TOP BAR */}
      <div className="border-b bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* CONVERSATION HEADER (PRO) */}
      <div className="border-b bg-white px-6 py-4">
        <div className="border-l-4 border-slate-900 pl-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {conversation.title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {conversation.lastActive} · ${conversation.cost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";

          return (
            <div
              key={msg.id}
              className={`flex ${isBot ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[65%]">
                {/* MESSAGE BUBBLE */}
                <div
                  className={`rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                    isBot
                      ? "bg-slate-900 text-white rounded-br-md"
                      : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>

                {/* TIME */}
                <div
                  className={`mt-1 text-xs text-gray-400 ${
                    isBot ? "text-right" : "text-left"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
