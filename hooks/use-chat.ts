"use client"

import { useState, useCallback, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"

export interface Citation {
  act_name: string
  act_year: string
  section: string | null
  text_excerpt: string
  relevance_score: number
  source_url?: string
}

export interface Helpline {
  number: string
  description: string
}

export interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  citations?: Citation[]
  helplines?: Helpline[]
  is_emergency?: boolean
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
  content: "হ্যালো, আমি চিত্রা—বাংলাদেশে নারীদের অধিকার ও আইন বিষয়ে সংক্ষিপ্ত, নির্ভরযোগ্য তথ্য দিই। আপনি কোন বিষয়ে জানতে চান—বিবাহ/তালাক, ভরণপোষণ, গার্হস্থ্য সহিংসতা, কর্মক্ষেত্রে হয়রানি, ন্যায্য মজুরি বা সম্পত্তির অধিকার?",
  sender: "bot",
  timestamp: new Date(),
}

// Get API_URL from environment variable
const getApiUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use NEXT_PUBLIC_ prefixed env var
    return process.env.NEXT_PUBLIC_API_URL || ""
  }
  // Server-side fallback (shouldn't be needed in this client component)
  return process.env.API_URL || ""
}

export function useChat(sessionId?: string) {
  const [chatSessions, setChatSessions] = useLocalStorage<ChatSession[]>("chatbot-sessions", [])
  const [currentSessionId, setCurrentSessionId] = useLocalStorage<string>("chatbot-current-session", "")

  const [state, setState] = useState<ChatState>({
    messages: [INITIAL_MESSAGE],
    isTyping: false,
    quickReplies: ["আচ্ছা", "জানি নাহ", "আরও জানতে চাই"],
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
    (content: string, sender: "user" | "bot", metadata?: { citations?: Citation[]; helplines?: Helpline[]; is_emergency?: boolean }) => {
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        content,
        sender,
        timestamp: new Date(),
        citations: metadata?.citations,
        helplines: metadata?.helplines,
        is_emergency: metadata?.is_emergency,
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
    async (content: string) => {
      if (!content.trim()) return

      addMessage(content.trim(), "user")
      setTyping(true)

      try {
        const apiUrl = getApiUrl()
        if (!apiUrl) {
          throw new Error("API_URL is not configured")
        }

        const response = await fetch(apiUrl, {
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
          // Handle new API response structure
          const responseText = data.response || data.output || ""
          addMessage(responseText, "bot", {
            citations: data.citations,
            helplines: data.helplines,
            is_emergency: data.is_emergency,
          })
          if (data.quickReplies) {
            setQuickReplies(data.quickReplies)
          }
        } else {
          throw new Error("Failed to send message")
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
      quickReplies: ["আচ্ছা", "জানি নাহ", "আরও জানতে চাই"],
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
