import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { UI } from "@/ui/ui";

export function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, ] = useState<string | null>(null);

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
      </motion.div>
    </div>
  );
}
