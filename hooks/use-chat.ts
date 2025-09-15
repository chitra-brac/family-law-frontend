"use client"

import { useState, useCallback, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"

export interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export interface ChatState {
  messages: Message[]
  isTyping: boolean
  quickReplies: string[]
}

export interface ChatSession {
  id: string
  messages: Message[]
  lastActivity: Date
  title?: string
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  content: "Hello, I'm Noaii. How can I help you?",
  sender: "bot",
  timestamp: new Date(),
}

export function useChat(sessionId?: string) {
  const [chatSessions, setChatSessions] = useLocalStorage<ChatSession[]>("chatbot-sessions", [])
  const [currentSessionId, setCurrentSessionId] = useLocalStorage<string>("chatbot-current-session", "")

  const [state, setState] = useState<ChatState>({
    messages: [INITIAL_MESSAGE],
    isTyping: false,
    quickReplies: ["OK", "No, I dunno", "Tell me more"],
  })

  // Load session from localStorage on mount
  useEffect(() => {
    const activeSessionId = sessionId || currentSessionId
    if (activeSessionId) {
      const session = chatSessions.find((s) => s.id === activeSessionId)
      if (session) {
        setState((prev) => ({
          ...prev,
          messages: session.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
      }
    }
  }, [sessionId, currentSessionId, chatSessions])

  // Save current session to localStorage
  const saveSession = useCallback(
    (messages: Message[]) => {
      const activeSessionId = sessionId || currentSessionId || `session-${Date.now()}`

      if (!currentSessionId && !sessionId) {
        setCurrentSessionId(activeSessionId)
      }

      const session: ChatSession = {
        id: activeSessionId,
        messages,
        lastActivity: new Date(),
        title: messages.find((m) => m.sender === "user")?.content.slice(0, 50) || "New Chat",
      }

      setChatSessions((prev) => {
        const existingIndex = prev.findIndex((s) => s.id === activeSessionId)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = session
          return updated
        }
        return [...prev, session]
      })
    },
    [sessionId, currentSessionId, setCurrentSessionId, setChatSessions],
  )

  const addMessage = useCallback(
    (content: string, sender: "user" | "bot") => {
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        content,
        sender,
        timestamp: new Date(),
      }

      setState((prev) => {
        const updatedMessages = [...prev.messages, newMessage]
        // Save to localStorage after state update
        setTimeout(() => saveSession(updatedMessages), 0)
        return {
          ...prev,
          messages: updatedMessages,
        }
      })

      return newMessage
    },
    [saveSession],
  )

  const setTyping = useCallback((isTyping: boolean) => {
    setState((prev) => ({
      ...prev,
      isTyping,
    }))
  }, [])

  const setQuickReplies = useCallback((replies: string[]) => {
    setState((prev) => ({
      ...prev,
      quickReplies: replies,
    }))
  }, [])

  const sendMessage = useCallback(
    async (content: string, webhookUrl?: string) => {
      if (!content.trim()) return

      // Add user message
      addMessage(content.trim(), "user")
      setTyping(true)

      try {
        if (webhookUrl) {
          // Send to n8n webhook
          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: content.trim(),
              timestamp: new Date().toISOString(),
              sessionId: sessionId || currentSessionId || `session-${Date.now()}`,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            addMessage(data.response || "I received your message!", "bot")

            // Update quick replies if provided
            if (data.quickReplies) {
              setQuickReplies(data.quickReplies)
            }
          } else {
            throw new Error("Failed to send message")
          }
        } else {
          // Fallback simulation
          await new Promise((resolve) => setTimeout(resolve, 1500))
          addMessage("Thanks for your message! I'm processing your request...", "bot")
        }
      } catch (error) {
        console.error("Error sending message:", error)
        addMessage("Sorry, I'm having trouble connecting. Please try again.", "bot")
      } finally {
        setTyping(false)
      }
    },
    [addMessage, setTyping, setQuickReplies, sessionId, currentSessionId],
  )

  const clearChat = useCallback(() => {
    setState({
      messages: [INITIAL_MESSAGE],
      isTyping: false,
      quickReplies: ["OK", "No, I dunno", "Tell me more"],
    })

    // Clear current session
    setCurrentSessionId("")
  }, [setCurrentSessionId])

  const loadSession = useCallback(
    (sessionIdToLoad: string) => {
      const session = chatSessions.find((s) => s.id === sessionIdToLoad)
      if (session) {
        setState((prev) => ({
          ...prev,
          messages: session.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        setCurrentSessionId(sessionIdToLoad)
      }
    },
    [chatSessions, setCurrentSessionId],
  )

  const deleteSession = useCallback(
    (sessionIdToDelete: string) => {
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionIdToDelete))
      if (currentSessionId === sessionIdToDelete) {
        clearChat()
      }
    },
    [setChatSessions, currentSessionId, clearChat],
  )

  return {
    ...state,
    sendMessage,
    clearChat,
    setQuickReplies,
    chatSessions,
    currentSessionId,
    loadSession,
    deleteSession,
  }
}
