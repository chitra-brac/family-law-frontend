import { BotAvatar } from "./bot-avatar"

export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start space-x-2">
        <BotAvatar size="sm" showTyping />
        <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
          <div className="flex space-x-1 items-center">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing"></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-typing"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-typing"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
