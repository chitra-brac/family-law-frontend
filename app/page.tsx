"use client"

import { useState, useEffect } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { ChatInterface } from "@/components/chat-interface"
import { WebhookConfig } from "@/components/webhook-config"

export default function ChatbotApp() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "chat" | "config">("welcome")
  const [webhookUrl, setWebhookUrl] = useState<string>("")

  const handleStartChat = () => {
    setCurrentScreen("chat")
  }

  const handleBackToWelcome = () => {
    setCurrentScreen("welcome")
  }

  const handleWebhookChange = (url: string) => {
    setWebhookUrl(url)
    // Save to localStorage
    if (typeof window !== "undefined") {
      if (url) {
        localStorage.setItem("chatbot-webhook-url", url)
      } else {
        localStorage.removeItem("chatbot-webhook-url")
      }
    }
  }

  // Load webhook URL from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWebhookUrl = localStorage.getItem("chatbot-webhook-url")
      if (savedWebhookUrl) {
        setWebhookUrl(savedWebhookUrl)
      }
    }
  }, [])

  return (
    <div className="w-full max-w-md mx-auto h-screen border-x border-border overflow-hidden">
      {currentScreen === "welcome" && (
        <WelcomeScreen onStartChat={handleStartChat} webhookUrl={webhookUrl} onWebhookChange={handleWebhookChange} />
      )}

      {currentScreen === "chat" && (
        <div className="h-full bg-background">
          <ChatInterface onBack={handleBackToWelcome} webhookUrl={webhookUrl} />
        </div>
      )}

      {currentScreen === "config" && (
        <div className="p-4 bg-background h-full">
          <WebhookConfig webhookUrl={webhookUrl} onWebhookChange={handleWebhookChange} />
          <div className="mt-4">
            <button onClick={handleBackToWelcome} className="text-primary hover:text-primary/80 text-sm">
              ← Back to Welcome
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
