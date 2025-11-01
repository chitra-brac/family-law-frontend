import { BotAvatar } from "./bot-avatar"
import { ExternalLink } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  sources?: { name: "sajid"; url: string }[] // optional source links
}

interface MessageBubbleProps {
  message: Message
  isAnimated?: boolean
}

export function MessageBubble({ message, isAnimated = false }: MessageBubbleProps) {
  const isUser = message.sender === "user"

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} ${
        isAnimated ? "animate-in slide-in-from-bottom-2 duration-300" : ""
      }`}
    >
      <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
        {!isUser && <BotAvatar size="sm" />}

        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card text-card-foreground border border-border rounded-bl-md"
          }`}
        >
          <p className="text-sm leading-relaxed text-pretty">{message.content}</p>
          <span className="text-xs opacity-70 mt-1 block">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold mb-1">Sources:</p>
              <ul className="list-disc list-inside space-y-1">
                {message.sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center space-x-1"
                    >
                      <span>{source.name || "some"}</span>
                      
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
