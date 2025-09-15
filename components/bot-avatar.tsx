import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface BotAvatarProps {
  size?: "sm" | "md" | "lg"
  showTyping?: boolean
}

export function BotAvatar({ size = "md", showTyping = false }: BotAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} border-2 border-primary/20 shadow-sm`}>
        <AvatarFallback className="bg-primary text-primary-foreground font-bold">N</AvatarFallback>
      </Avatar>

      {showTyping && (
        <div className="absolute -top-1 -right-1 bg-primary rounded-full px-2 py-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full animate-typing"></div>
            <div className="w-1 h-1 bg-white rounded-full animate-typing" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-1 h-1 bg-white rounded-full animate-typing" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      )}
    </div>
  )
}
