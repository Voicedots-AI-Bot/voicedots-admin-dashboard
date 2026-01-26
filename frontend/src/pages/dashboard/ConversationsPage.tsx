import { useMemo, useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UI } from "@/ui/ui";
import { ConversationCard } from "@/components/ConversationCard";
import conversationsApi from "@/api/conversations";
import type { ConversationSummary } from "@/types/conversation.types";

export function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchConversations() {
      try {
        setIsLoading(true);
        const data = await conversationsApi.getConversations();
        setConversations(data);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, []);

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    return conversations
      .filter((conv) => {
        const title = conv.call_summary_title ?? "";
        const id = conv.conversation_id ?? "";
        
        const searchLower = searchQuery.toLowerCase();
        
        return (
          title.toLowerCase().includes(searchLower) || 
          id.toLowerCase().includes(searchLower)
        );
      })
      // .sort(
      //   (a, b) => new Date(b.start_time_unix_secs).getTime() - new Date(a.start_time_unix_secs).getTime()
      // );
  }, [searchQuery, conversations]);

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
        {isLoading ? (
          // 4. Added Loading State
          <div className="flex flex-col items-center justify-center p-10 gap-2">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: UI.colors.text.muted }} />
            <span style={{ color: UI.colors.text.muted }}>Fetching conversations...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
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
              key={conversation.conversation_id}
              onClick={() =>
                navigate(`/dashboard/conversations/${conversation.conversation_id}`)
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
