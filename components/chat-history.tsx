"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, MessageCircle } from "lucide-react"
import type { ChatSession } from "@/hooks/use-chat"

interface ChatHistoryProps {
  sessions: ChatSession[]
  currentSessionId: string
  onLoadSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onClose: () => void
}

export function ChatHistory({ sessions, currentSessionId, onLoadSession, onDeleteSession, onClose }: ChatHistoryProps) {
  const sortedSessions = sessions.sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  )

  return (
    <div className="p-4 h-screen bg-background overflow-y-auto">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat History
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No chat history yet</p>
          ) : (
            sortedSessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                  session.id === currentSessionId ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => {
                  onLoadSession(session.id)
                  onClose()
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{session.title || "Untitled Chat"}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(session.lastActivity).toLocaleDateString()} • {session.messages.length} messages
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    {session.id === currentSessionId && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
