import { BotAvatar } from "./bot-avatar"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
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
        </div>
      </div>
    </div>
  )
}
