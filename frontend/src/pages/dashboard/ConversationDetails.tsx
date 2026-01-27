import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, User } from "lucide-react";
import conversationsApi from "@/api/conversations";
import { UI } from "@/ui/colors"; 
import type { ConversationDetail } from "@/types/conversation.types";
import logoIcon from "@/assets/logo.png";

export function ConversationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ConversationDetail[] | null>(null);

  useEffect(() => {
    async function fetchConversationDetails() {
      try {
        setIsLoading(true);
        if (id) {
          const data = await conversationsApi.getConversationDetails(id);
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConversationDetails();
  }, [id]);

  if (!isLoading && !messages) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-10" style={{ color: UI.colors.text.muted }}>
        <p>Conversation not found</p>
        <button 
          onClick={() => navigate('/dashboard/conversations')} 
          className="mt-4 text-sm underline"
          style={{ color: UI.colors.primary }}
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* TOP BAR */}
      <div className="border-b px-4 py-3" style={{ background: UI.colors.surface.glassSm, borderColor: UI.colors.border.glass }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: UI.colors.text.secondary }}
          onMouseEnter={(e) => (e.currentTarget.style.color = UI.colors.primary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = UI.colors.text.secondary)}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* CONVERSATION HEADER */}
      <div className="border-b px-6 py-4" style={{ background: UI.colors.surface.glassXs, borderColor: UI.colors.border.glass }}>
        <div className="pl-4" style={{ borderLeft: `4px solid ${UI.colors.primary}` }}>
          <h2 className="text-lg font-semibold" style={{ color: UI.colors.text.primary }}>
            Transcript Details
          </h2>
          <p className="text-xs uppercase tracking-widest mt-1" style={{ color: UI.colors.text.muted }}>
            ID: {id}
          </p>
        </div>
      </div>

      {/* MESSAGES CONTAINER */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: UI.colors.primary }} />
            <span style={{ color: UI.colors.text.muted }}>Fetching transcript...</span>
          </div>
        ) : (
          messages?.map((msg, index) => {
            const isBot = msg.role === "agent";
            if (!msg.message && !msg.tool_calls?.length) return null;

            return (
              <div
                key={index}
                className={`flex items-end gap-3 ${isBot ? "justify-start" : "justify-end"}`}
              >
                {isBot && (
                  <div className="flex-shrink-0 mb-5">
                    <img 
                      src={logoIcon} 
                      className="w-8 h-8 rounded-full border" 
                      style={{ borderColor: UI.colors.border.subtle }} 
                    />
                  </div>
                )}

                <div className={`flex flex-col max-w-[75%] ${isBot ? "items-start" : "items-end"}`}>
                  {/* MESSAGE BUBBLE */}
                  <div
                    className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      background: isBot ? UI.colors.surface.glassSm : UI.colors.primary,
                      color: isBot ? UI.colors.text.primary : UI.colors.text.inverse,
                      border: `1px solid ${UI.colors.border.glass}`,
                      boxShadow: UI.colors.shadow.sm,
                      borderRadius: isBot ? "16px 16px 16px 0px" : "16px 16px 0px 16px"
                    }}
                  >
                    {msg.message || (msg.tool_calls?.length > 0 && (
                      <span className="italic opacity-70">Processing system action...</span>
                    ))}
                  </div>

                  {/* TIME & STATUS */}
                  <div 
                    className="mt-1.5 flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-tighter"
                    style={{ color: UI.colors.text.muted }}
                  >
                    <span>{Math.floor(msg.time_in_call_secs / 60)}:{(msg.time_in_call_secs % 60).toString().padStart(2, '0')}</span>
                    {msg.interrupted && <span style={{ color: UI.colors.danger }}>• Interrupted</span>}
                  </div>
                </div>

                {!isBot && (
                  <div 
                    className="flex-shrink-0 mb-5 flex items-center justify-center w-8 h-8 rounded-full border"
                    style={{ background: UI.colors.surface.glassSm, borderColor: UI.colors.border.glass, color: UI.colors.text.icon }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}