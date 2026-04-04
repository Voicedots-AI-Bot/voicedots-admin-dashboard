import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { UI } from "@/ui/colors";
import { ConversationCard } from "@/components/ConversationCard";
import conversationsApi from "@/api/conversations";
import type { ConversationsListSummary } from "@/types/conversation.types";
import { useAuth } from "@/context/AuthContext";

export function ConversationsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] =
    useState<ConversationsListSummary[]>([]);
  const [page, setPage] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [, setStack] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const push = (item: string) => {
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

  const fetchConversations = useCallback(
    async (cursor: string | null = null) => {
      try {
        setIsLoading(true);
        const data = await conversationsApi.getConversations(
          user?.agent_id,
          cursor
        );
        setConversations(data.conversations);
        setNextPage(data.nextPage);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.agent_id]
  );

  useEffect(() => {
    fetchConversations(null);
  }, [fetchConversations]);

  const handleNext = () => {
    if (!nextPage) return;
    push(nextPage);
    setPage(page + 1);
    setCurrentIndex(currentIndex + conversations.length);
    fetchConversations(nextPage);
  };

  const handlePrev = () => {
    if (page === 0) return;
    setPage(page - 1);
    setNextPage(pop() ?? null);
    setCurrentIndex(currentIndex - conversations.length);
    fetchConversations(nextPage);
  };

  const filteredConversations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        (c.title ?? "").toLowerCase().includes(q) ||
        (c.conversation_id ?? "").toLowerCase().includes(q)
    );
  }, [searchQuery, conversations]);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: UI.colors.text.primary }}
          >
            Conversations
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: UI.colors.text.secondary }}
          >
            Manage and track your bot interactions.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations"
            className="
              h-10 w-full
              rounded-lg border
              pl-9 pr-3 text-sm
              outline-none
            "
          />
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between md:justify-end gap-2">
        <button
          onClick={handlePrev}
          disabled={page === 0 || isLoading}
          className="
            flex items-center gap-1
            rounded-md border
            px-3 py-1.5 text-xs
            md:px-4 md:py-2 md:text-sm
            disabled:opacity-50
          "
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!nextPage || isLoading}
          className="
            flex items-center gap-1
            rounded-md border
            px-3 py-1.5 text-xs
            md:px-4 md:py-2 md:text-sm
            disabled:opacity-50
          "
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-3 pr-1 md:pr-2">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : (
          filteredConversations.map((conversation, index) => (
            <ConversationCard
              key={conversation.conversation_id}
              conversation={conversation}
              index={index + currentIndex}
            />
          ))
        )}
      </div>
    </div>
  );
}
