import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UI } from "@/ui/ui";
import { ConversationCard } from "@/components/ConversationCard";
import { MOCK_CONVERSATIONS } from "@/utils/mockData";

export function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredConversations = useMemo(() => {
    return MOCK_CONVERSATIONS
      .filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [searchQuery]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: UI.colors.text.primary }}
          >
            Conversations
          </h1>
          <p
            className="mt-1"
            style={{ color: UI.colors.text.secondary }}
          >
            Manage and track your bot interactions.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div
        className="rounded-2xl p-4 backdrop-blur-md"
        style={{
          background: UI.colors.surface.glassSm,
          border: `1px solid ${UI.colors.border.strong}`,
        }}
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
            style={{ color: UI.colors.text.muted }}
          />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl pl-10 pr-4 text-sm outline-none transition-all"
            style={{
              background: UI.colors.surface.glassMd,
              border: `1px solid ${UI.colors.border.glass}`,
              color: UI.colors.text.primary,
            }}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        {filteredConversations.length === 0 ? (
          <div
            className="rounded-xl p-6 text-center text-sm"
            style={{
              background: UI.colors.surface.glassSm,
              color: UI.colors.text.muted,
            }}
          >
            No conversations found
          </div>
        ) : (
     filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() =>
              navigate(
                `/dashboard/conversations/${conversation.id}`,
                { replace: true }
              )
            }
            className="cursor-pointer"
          >
            <ConversationCard conversation={conversation} />
          </div>
        ))

        )}
      </div>
    </div>
  );
}
