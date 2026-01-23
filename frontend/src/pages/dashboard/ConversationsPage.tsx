import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { MOCK_CONVERSATIONS } from "../../utils/mockData";
import { ConversationListItem } from "../../components/ConversationListItem";
import { ChatView } from "@/components/ChatView";
import { UI } from "@/ui/ui";

export function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "pending" | "completed">("all");
  const [sortBy, setSortBy] =
    useState<"date" | "cost" | "messages">("date");
  const [selectedConversation, setSelectedConversation] =
    useState<string | null>(null);

  const filteredConversations = useMemo(() => {
    return MOCK_CONVERSATIONS.filter((conv) => {
      const matchesSearch = conv.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || conv.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === "date")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "cost") return b.cost - a.cost;
      if (sortBy === "messages") return b.messages - a.messages;
      return 0;
    });
  }, [searchQuery, statusFilter, sortBy]);

  const selectedConv = MOCK_CONVERSATIONS.find(
    (c) => c.id === selectedConversation
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* LEFT PANEL */}
      <motion.div
        animate={{ width: selectedConversation ? "35%" : "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col space-y-6 min-w-0"
      >
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
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
        </div>

        {/* List / Empty State */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation, index) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                index={index}
                onClick={() => setSelectedConversation(conversation.id)}
                isSelected={selectedConversation === conversation.id}
              />
            ))
          ) : (
            <div
              className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed text-center"
              style={{
                background: UI.colors.surface.glassXs,
                borderColor: UI.colors.border.dashed,
              }}
            >
              <div
                className="rounded-full p-4"
                style={{ background: UI.colors.surface.glassSm }}
              >
                <Search
                  className="h-8 w-8"
                  style={{ color: UI.colors.text.icon }}
                />
              </div>
              <h3
                className="mt-4 text-lg font-medium"
                style={{ color: UI.colors.text.primary }}
              >
                No conversations found
              </h3>
              <p style={{ color: UI.colors.text.muted }}>
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* RIGHT PANEL – CHAT */}
      <AnimatePresence>
        {selectedConversation && selectedConv && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "65%" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ChatView
              conversation={selectedConv}
              onClose={() => setSelectedConversation(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
