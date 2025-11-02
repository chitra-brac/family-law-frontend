"use client"

import { useState } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { ChatInterface } from "@/components/chat-interface"

export default function ChatbotApp() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "chat">("welcome")

  const handleStartChat = () => {
    setCurrentScreen("chat")
  }

  const handleBackToWelcome = () => {
    setCurrentScreen("welcome")
  }

  return (
    <div className="w-full max-w-md mx-auto h-screen border-x border-border overflow-hidden">
      {currentScreen === "welcome" && <WelcomeScreen onStartChat={handleStartChat} />}

      {currentScreen === "chat" && (
        <div className="h-full bg-background">
          <ChatInterface onBack={handleBackToWelcome} />
        </div>
      )}
    </div>
  )
}
