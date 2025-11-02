import { BotAvatar } from "./bot-avatar";
import { Phone, AlertTriangle, BookOpen, ExternalLink } from "lucide-react";

interface Citation {
  act_name: string;
  act_year: string;
  section: string | null;
  text_excerpt: string;
  relevance_score: number;
  source_url?: string;
}

interface Helpline {
  number: string;
  description: string;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  citations?: Citation[];
  helplines?: Helpline[];
  is_emergency?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isAnimated?: boolean;
}

export function MessageBubble({
  message,
  isAnimated = false,
}: MessageBubbleProps) {
  const isUser = message.sender === "user";

  // Format phone number for tel: link (remove spaces, dashes, keep digits and +)
  const formatPhoneLink = (phone: string) => {
    return `tel:${phone.replace(/[\s-]/g, "")}`;
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} ${
        isAnimated ? "animate-in slide-in-from-bottom-2 duration-300" : ""
      }`}
    >
      <div
        className={`flex items-start space-x-2 max-w-[80%] ${
          isUser ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        {!isUser && <BotAvatar size="sm" />}

        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : message.is_emergency
              ? "bg-red-50 dark:bg-red-950/30 border-2 border-red-500 rounded-bl-md"
              : "bg-card text-card-foreground border border-border rounded-bl-md"
          }`}
        >
          {/* Emergency Alert */}
          {message.is_emergency && (
            <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/50 rounded-lg border border-red-300 dark:border-red-700">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <p className="text-xs font-bold text-red-800 dark:text-red-300">
                  জরুরি সহায়তা প্রয়োজন
                </p>
              </div>
            </div>
          )}

          {/* Main Message Content */}
          <p
            className={`text-sm leading-relaxed text-pretty whitespace-pre-wrap ${
              message.is_emergency && !isUser
                ? "text-gray-900 dark:text-gray-100"
                : ""
            }`}
          >
            {message.content}
          </p>

          {/* Helplines - Show prominently, especially for emergencies */}
          {message.helplines && message.helplines.length > 0 && (
            <div
              className={`mt-3 pt-3 ${
                isUser
                  ? "border-primary/20"
                  : message.is_emergency
                  ? "border-red-300 dark:border-red-700"
                  : "border-gray-200 dark:border-gray-700"
              } border-t`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-3.5 h-3.5 opacity-70" />
                <p className="text-xs font-semibold">
                  {message.is_emergency
                    ? "জরুরি হেল্পলাইন"
                    : "সাহায্যের জন্য কল করুন"}
                </p>
              </div>
              <div className="space-y-1.5">
                {message.helplines.map((helpline, index) => (
                  <a
                    key={index}
                    href={formatPhoneLink(helpline.number)}
                    className="block text-xs py-1.5 px-2 rounded bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-700 dark:text-blue-300">
                        {helpline.number}
                      </span>
                      <Phone className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 block mt-0.5">
                      {helpline.description}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-3.5 h-3.5 opacity-70" />
                <p className="text-xs font-semibold">আইনি উৎস</p>
              </div>
              <div className="space-y-2">
                {message.citations.map((citation, index) => (
                  <div
                    key={index}
                    className={`text-xs bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-800 ${
                      citation.source_url
                        ? "hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        : ""
                    }`}
                  >
                    {citation.source_url ? (
                      <a
                        href={citation.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 flex-1">
                            {citation.act_name} ({citation.act_year})
                            {citation.section && ` - ধারা ${citation.section}`}
                          </p>
                          <ExternalLink className="w-3 h-3 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 text-[11px] leading-relaxed line-clamp-3">
                          {citation.text_excerpt}
                        </p>
                        {citation.relevance_score && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                            প্রাসঙ্গিকতা:{" "}
                            {Math.round(citation.relevance_score * 100)}%
                          </p>
                        )}
                      </a>
                    ) : (
                      <>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {citation.act_name} ({citation.act_year})
                          {citation.section && ` - ধারা ${citation.section}`}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 text-[11px] leading-relaxed line-clamp-3">
                          {citation.text_excerpt}
                        </p>
                        {citation.relevance_score && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                            প্রাসঙ্গিকতা:{" "}
                            {Math.round(citation.relevance_score * 100)}%
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <span
            className={`text-xs opacity-70 mt-2 block ${
              message.is_emergency && !isUser
                ? "text-gray-700 dark:text-gray-300"
                : ""
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
