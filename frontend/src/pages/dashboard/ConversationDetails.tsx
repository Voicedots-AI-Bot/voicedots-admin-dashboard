import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Phone, 
  Mail, 
  Briefcase, 
  AlertCircle,
} from "lucide-react";
import conversationsApi from "@/api/conversations";
import { UI } from "@/ui/colors";
import type { GetConversationDetailsResult } from "@/types/conversation.types";
import logoIcon from "@/assets/logo.png";
import { ConversationAudioPlayer } from "@/components/ConversationAudioPlayer";
import voiceMp3 from "@/utils/voice.mp3";

const formatTime = (timestamp: number) => {
  if (!timestamp) return "";
  const date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000); 
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export function ConversationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const [data, setData] = useState<GetConversationDetailsResult | null>(null);

  const audioUrl = voiceMp3;

  useEffect(() => {
    async function fetchConversationDetails() {
      try {
        setIsLoading(true);
        if (id) {
          const response = await conversationsApi.getConversationDetails(id);
          setData(response);
        }
      } catch (error) {
        console.error("Failed to load conversation details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConversationDetails();
  }, [id]);

  const lead = data?.lead;
  const messages = data?.transcription;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* --- TOP NAV --- */}
      <div className="border-b border-gray-200 px-4 py-3 bg-white sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <div className="p-1 rounded-full group-hover:bg-gray-100">
             <ArrowLeft size={16} />
          </div>
          Back to Conversations
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* --- HEADER SECTION --- */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div 
                className="pl-4" 
                style={{ borderLeft: `4px solid ${UI.colors.primary}` }}
              >
                <h1 className="text-2xl font-bold text-gray-800">Transcript Details</h1>
                <p className="text-sm text-gray-500 mt-1 font-mono">ID: {id}</p>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <ConversationAudioPlayer audioUrl={audioUrl} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          ) : (
            <>
              {/* --- LEAD DETAILS CARD --- */}
              {lead && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    Lead Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Name */}
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-medium mb-1">Full Name</span>
                      <span className="text-sm font-semibold text-gray-900">{lead.name || "N/A"}</span>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-medium mb-1">Phone Number</span>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone size={14} className="text-gray-400" />
                        {lead.phone_number || "N/A"}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-medium mb-1">Email Address</span>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail size={14} className="text-gray-400" />
                        <span className="truncate" title={lead.email}>{lead.email || "N/A"}</span>
                      </div>
                    </div>

                    {/* Business */}
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-medium mb-1">Business Context</span>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Briefcase size={14} className="text-gray-400" />
                        <span className="truncate" title={lead.business_desc}>
                          {lead.business_desc || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TRANSCRIPT --- */}
              <div className="space-y-6 pb-10">
                <div className="flex items-center justify-center mb-6">
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                    Conversation Start
                  </span>
                </div>

                {messages?.map((msg, index) => {
                  const isAgent = msg.role === "agent";
                  if (!msg.message) return null;

                  return (
                    <div
                      key={index}
                      className={`flex gap-4 ${isAgent ? "flex-row" : "flex-row-reverse"}`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                         {isAgent ? (
                           <img 
                             src={logoIcon} 
                             alt="Agent" 
                             className="w-10 h-10 rounded-full border border-gray-200 bg-white object-contain p-1" 
                           />
                         ) : (
                           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                               <User size={18} className="text-blue-600" />
                           </div>
                         )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`flex flex-col max-w-[75%] ${isAgent ? "items-start" : "items-end"}`}>
                        
                        {/* Sender Name & Time */}
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-semibold text-gray-700">
                            {isAgent ? (msg.avatar || "Voicedots bots") : (lead?.name || "User")}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>

                        {/* Bubble */}
                        <div
                          className={`relative rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                            isAgent
                              ? "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                              : "text-white rounded-tr-none"
                          }`}
                          style={{
                            backgroundColor: isAgent ? undefined : UI.colors.primary,
                          }}
                        >
                          {msg.message}

                          {/* Interruption Indicator */}
                          {msg.interrupted && (
                             <div className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${
                               isAgent ? "text-red-500" : "text-white/90"
                             }`}>
                               <AlertCircle size={12} />
                               <span>Interrupted</span>
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}