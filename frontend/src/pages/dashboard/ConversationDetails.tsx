import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, User } from "lucide-react";
import conversationsApi from "@/api/conversations";
import { UI } from "@/ui/colors";
import type { ConversationDetail } from "@/types/conversation.types";
import logoIcon from "@/assets/logo.png";
import { ConversationAudioPlayer } from "@/components/ConversationAudioPlayer";
import voiceMp3 from "@/utils/voice.mp3";
export function ConversationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ConversationDetail[] | null>(null);

  // sample mp3
const audioUrl = voiceMp3;


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

  return (
    <div className="flex h-full flex-col bg-white">
      {/* TOP BAR */}
      <div className="border-b px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* HEADER */}
      <div className="border-b px-6 py-4">
        <div className="flex items-start justify-between gap-6">
          {/* Left title */}
          <div
            className="pl-4"
            style={{ borderLeft: `4px solid ${UI.colors.primary}` }}
          >
            <h2 className="text-lg font-semibold">
              Transcript Details
            </h2>
            <p className="text-xs uppercase tracking-widest mt-1">
              ID: {id}
            </p>
          </div>

          {/* Right audio */}
          <ConversationAudioPlayer audioUrl={audioUrl} />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          messages?.map((msg, index) => {
            const isBot = msg.role === "agent";
            if (!msg.message && !msg.tool_calls?.length) return null;

            return (
              <div
                key={index}
                className={`flex items-end gap-3 ${
                  isBot ? "justify-start" : "justify-end"
                }`}
              >
                {isBot && (
                  <img
                    src={logoIcon}
                    className="w-8 h-8 rounded-full"
                  />
                )}

                <div
                  className="rounded-2xl px-4 py-2.5 max-w-[70%]"
                  style={{
                    background: isBot
                      ? UI.colors.surface.glassSm
                      : UI.colors.primary,
                    color: isBot
                      ? UI.colors.text.primary
                      : UI.colors.text.inverse,
                  }}
                >
                  {msg.message || (
                    <span className="italic opacity-70">
                      Processing system action…
                    </span>
                  )}
                </div>

                {!isBot && (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full border">
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
