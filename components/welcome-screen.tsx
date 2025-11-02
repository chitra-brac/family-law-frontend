"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AvatarImage } from "@radix-ui/react-avatar"

interface WelcomeScreenProps {
  onStartChat: () => void
}

export function WelcomeScreen({ onStartChat }: WelcomeScreenProps) {

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center p-6 text-white relative"
      style={{
        background: "linear-gradient(135deg, #6b5ce6 0%, #9b77e5 100%)",
        minHeight: "100vh",
        minWidth: "100%",
      }}
    >
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
          আমি চিত্রা
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
    </div>
  )
}
