import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, DollarSign, Clock } from "lucide-react";
import { MOCK_MESSAGES } from "@/utils/mockData";
import type { Conversation, Message } from "@/utils/mockData";
import { UI } from "@/ui/ui";

interface ChatViewProps {
  conversation: Conversation;
  onClose: () => void;
}

export function ChatView({ conversation, onClose }: ChatViewProps) {
  const [messageInput, setMessageInput] = useState("");

  const messages = MOCK_MESSAGES.filter(
    (m) => m.conversationId === conversation.id
  );

  const handleSend = () => {
    if (messageInput.trim()) {
      console.log("Sending:", messageInput);
      setMessageInput("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="flex h-full flex-col rounded-2xl overflow-hidden backdrop-blur-md"
      style={{
        background: UI.colors.surface.glassSm,
        border: `1px solid ${UI.colors.border.strong}`,
      }}
    >
      {/* HEADER */}
      <div
        className="flex items-center justify-between p-4"
        style={{
          background: UI.colors.surface.glassMd,
          borderBottom: `1px solid ${UI.colors.border.glass}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
            style={{
              backgroundImage: UI.colors.gradient.accent,
              color: UI.colors.text.inverse,
              boxShadow: UI.colors.shadow.sm,
            }}
          >
            {conversation.initials}
          </div>

          <div>
            <h3
              className="font-semibold"
              style={{ color: UI.colors.text.primary }}
            >
              {conversation.title}
            </h3>
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: UI.colors.text.muted }}
            >
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {conversation.lastActive}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <DollarSign size={12} />${conversation.cost}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 transition-colors"
          style={{
            color: UI.colors.text.secondary,
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message, index: number) => {
          const isBot = message.sender === "bot";

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${isBot ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[75%]">
                <div
                  className="rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: isBot
                      ? UI.colors.gradient.accent
                      : UI.colors.surface.glassLg,
                    color: isBot
                      ? UI.colors.text.inverse
                      : UI.colors.text.primary,
                    borderTopRightRadius: isBot ? "0.25rem" : undefined,
                    borderTopLeftRadius: !isBot ? "0.25rem" : undefined,
                  }}
                >
                  {message.content}

                  {message.cost && (
                    <div className="mt-2 flex items-center gap-1 text-xs opacity-70">
                      <DollarSign size={10} />
                      {message.cost.toFixed(2)}
                    </div>
                  )}
                </div>

                <div
                  className={`mt-1 text-xs ${
                    isBot ? "text-right" : "text-left"
                  }`}
                  style={{ color: UI.colors.text.muted }}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* INPUT */}
      <div
        className="p-4"
        style={{
          background: UI.colors.surface.glassMd,
          borderTop: `1px solid ${UI.colors.border.glass}`,
        }}
      >
        {/* <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{
              background: UI.colors.surface.glassLg,
              border: `1px solid ${UI.colors.border.glass}`,
              color: UI.colors.text.primary,
            }}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            className="flex items-center gap-2 rounded-xl px-5 py-3 font-medium"
            style={{
              backgroundImage: UI.colors.gradient.accent,
              color: UI.colors.text.inverse,
              boxShadow: UI.colors.shadow.md,
            }}
          >
            <Send size={18} />
          </motion.button>
        </div> */}
      </div>
    </motion.div>
  );
}
