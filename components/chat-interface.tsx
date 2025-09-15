"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, X, Send, Camera, History } from "lucide-react"
import { BotAvatar } from "./bot-avatar"
import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"
import { QuickReplies } from "./quick-replies"
import { ChatHistory } from "./chat-history"
import { useChat } from "@/hooks/use-chat"

interface ChatInterfaceProps {
  onBack: () => void
  webhookUrl?: string
}

export function ChatInterface({ onBack, webhookUrl }: ChatInterfaceProps) {
  const {
    messages,
    isTyping,
    quickReplies,
    sendMessage,
    clearChat,
    chatSessions,
    currentSessionId,
    loadSession,
    deleteSession,
  } = useChat()

  const [inputValue, setInputValue] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    await sendMessage(inputValue, webhookUrl)
    setInputValue("")
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply, webhookUrl)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (showHistory) {
    return (
      <ChatHistory
        sessions={chatSessions}
        currentSessionId={currentSessionId}
        onLoadSession={loadSession}
        onDeleteSession={deleteSession}
        onClose={() => setShowHistory(false)}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center space-x-2">
          <BotAvatar size="sm" />
          <span className="font-semibold text-foreground">Noaii</span>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(true)}
            className="text-foreground hover:bg-muted"
          >
            <History className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={clearChat} className="text-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble key={message.id} message={message} isAnimated={index === messages.length - 1} />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Buttons */}
      <QuickReplies replies={quickReplies} onReply={handleQuickReply} />

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              className="pr-12 rounded-full border-border focus:ring-primary"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
            <Camera className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
