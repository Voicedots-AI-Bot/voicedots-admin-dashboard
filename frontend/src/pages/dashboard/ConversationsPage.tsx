import { useMemo, useState, useEffect, useCallback } from "react";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { UI } from "@/ui/colors";
import { ConversationCard } from "@/components/ConversationCard";
import conversationsApi from "@/api/conversations";
import type { ConversationsListSummary } from "@/types/conversation.types";

export function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationsListSummary[]>([]);
  const [page, setPage] = useState<number>(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [, setStack] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  // const navigate = useNavigate();

  // useEffect(() => {
  //   async function fetchConversations() {
  //     try {
  //       setIsLoading(true);
  //       const data = await conversationsApi.getConversations();
  //       setConversations(data.conversations);
  //       setNextPage(data.nextPage);
  //     } catch (error) {
  //       console.error("Failed to load conversations:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }

  //   fetchConversations();
  // }, []);

  const push = (item: string): void => {
    setStack((prev) => [...prev, item]);
  };

  const pop = (): string | undefined => {
    let popped: string | undefined;

    setStack((prev) => {
      if (prev.length === 0) return prev;

      popped = prev[prev.length - 1];
      return prev.slice(0, -1);
    });

    return popped;
  };
    
  const fetchConversations = useCallback(async (cursor: string | null = null) => {
    try {
      setIsLoading(true);
      const data = await conversationsApi.getConversations(null, cursor);
      setConversations(data.conversations);
      setNextPage(data.nextPage);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations(null);
  }, [fetchConversations]);

  const handleNext = () => {
    if (nextPage) {
      push(nextPage);
      setPage(page + 1);
      setCurrentIndex(currentIndex + conversations.length);
      fetchConversations(nextPage);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1);
      setNextPage(pop() ?? null)
      setCurrentIndex(currentIndex - conversations.length);
      fetchConversations(nextPage);
    }
  };

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    return conversations
      .filter((conv) => {
        const title = conv.title ?? "";
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
          border: `1px solid ${UI.colors.border.dark}`,
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

      {/* Next/Previous Page Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0 || isLoading}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
          style={{
            background: UI.colors.surface.glassSm,
            border: `1px solid ${UI.colors.border.glass}`,
            color: currentIndex === 0 ? UI.colors.text.muted : UI.colors.text.primary,
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!nextPage || isLoading}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
          style={{
            background: UI.colors.surface.glassSm,
            border: `1px solid ${UI.colors.border.glass}`,
            color: !nextPage ? UI.colors.text.muted : UI.colors.text.primary,
          }}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Conversation List */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-2">
        {isLoading ? (
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
          filteredConversations.map((conversation, index) => (
            <div
              key={conversation.conversation_id}
              className="cursor-pointer"
            >
              <ConversationCard conversation={conversation} index={index + currentIndex} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
