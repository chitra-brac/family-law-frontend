"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { WebhookConfig } from "@/components/webhook-config"
import { Settings } from "lucide-react"
import { AvatarImage } from "@radix-ui/react-avatar"

interface WelcomeScreenProps {
  onStartChat: () => void
  webhookUrl?: string
  onWebhookChange: (url: string) => void
}

export function WelcomeScreen({ onStartChat, webhookUrl, onWebhookChange }: WelcomeScreenProps) {
  const [showConfig, setShowConfig] = useState(false)

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center p-6 text-white relative"
      style={{
        background: "linear-gradient(135deg, #6b5ce6 0%, #9b77e5 100%)",
        minHeight: "100vh",
        minWidth: "100%",
      }}
    >
      {/* Settings button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowConfig(!showConfig)}
          className="text-white hover:bg-white/10"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Bot Avatar with gentle bounce animation */}
      <div className="mb-8 animate-bounce-gentle z-10">
        <Avatar className="w-40 h-40 border-4 border-white/20 shadow-lg">
        <AvatarImage 
            src="../../nira.png"
            alt="Noaii Logo"
          />
          <AvatarFallback
            className="text-2xl font-bold"
            style={{
              backgroundColor: "#8b7ae6",
              color: "#ffffff",
            }}
          >
            N 
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Welcome Message */}
      <div className="text-center mb-12 space-y-4 z-10">
        <h1 className="text-2xl font-bold text-balance" style={{ color: "#ffffff" }}>
          Hello
          <br />
          আমি ইরা
        </h1>

        <p className="text-lg text-balance" style={{ color: "#ffffff" }}>
          আপনাকে আপনার আধিকার সম্পর্কে জানতে এখানে আছি!
        </p>
      </div>

      {/* CTA Button */}
      <Button
        onClick={onStartChat}
        size="lg"
        className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 z-10"
      >
        জানতে চাই। 
      </Button>

      {/* Webhook Config Overlay */}
      {showConfig && (
        <div className="absolute inset-0 z-30 flex flex-col" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowConfig(false)}>
                Close
              </Button>
            </div>
            <WebhookConfig webhookUrl={webhookUrl} onWebhookChange={onWebhookChange} />
          </div>
        </div>
      )}
    </div>
  )
}
