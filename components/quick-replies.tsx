"use client"

import { Button } from "@/components/ui/button"

interface QuickRepliesProps {
  replies: string[]
  onReply: (reply: string) => void
}

export function QuickReplies({ replies, onReply }: QuickRepliesProps) {
  if (replies.length === 0) return null

  return (
    <div className="px-4 py-2">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {replies.map((reply, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onReply(reply)}
            className="whitespace-nowrap rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors"
          >
            {reply}
          </Button>
        ))}
      </div>
    </div>
  )
}
