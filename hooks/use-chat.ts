"use client"

import { useState, useCallback, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"
import type { ChatMessage, ChatRequest, ChatResponse } from "@/types/chat"

export interface Citation {
  act_name: string
  act_year: string
  section: string | null
  text_excerpt: string
  relevance_score: number
  source_url: string | null
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

/**
 * Convert internal Message format to API ChatMessage format
 * Filters out the welcome message and maps sender to role
 */
const convertToApiMessages = (messages: Message[]): ChatMessage[] => {
  return messages
    .filter((msg) => msg.id !== "welcome") // Don't send the initial welcome message
    .map((msg) => ({
      role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }))
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

/**
 * Detect if user is on a mobile device
 */
const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

/**
 * Poll for async chat result
 */
const pollForResult = async (apiUrl: string, requestId: string, maxAttempts = 60): Promise<ChatResponse> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${apiUrl}/chat/${requestId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch chat status: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === "completed" && data.result) {
      return data.result as ChatResponse
    }

    if (data.status === "error") {
      throw new Error(data.error || "Chat processing failed")
    }

    // Still pending, wait 1 second before next poll
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error("Chat request timed out")
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

  /**
   * Send message using async endpoint (for mobile devices)
   * Submits request and polls for result
   */
  const sendMessageAsync = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      // Add user message immediately to UI
      addMessage(content.trim(), "user")
      setTyping(true)

      try {
        const apiUrl = getApiUrl()
        if (!apiUrl) {
          throw new Error("API_URL is not configured")
        }

        // Convert current messages to conversation history
        const conversationHistory = convertToApiMessages(state.messages)

        const requestBody: ChatRequest = {
          message: content.trim(),
          timestamp: new Date().toISOString(),
          sessionId: sessionId || currentSessionId || `session-${Date.now()}`,
          conversationHistory: conversationHistory,
        }

        // Submit async request
        const submitResponse = await fetch(`${apiUrl}/chat/async`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        if (!submitResponse.ok) {
          throw new Error(`API request failed with status ${submitResponse.status}`)
        }

        const asyncData = await submitResponse.json()
        const requestId = asyncData.requestId

        if (!requestId) {
          throw new Error("No request ID returned from async endpoint")
        }

        // Poll for result
        const result = await pollForResult(apiUrl, requestId)

        // Add bot response to UI
        const responseText = result.response || ""
        addMessage(responseText, "bot", {
          citations: result.citations || undefined,
          helplines: result.helplines || undefined,
          is_emergency: result.is_emergency,
        })

        if (result.quickReplies && result.quickReplies.length > 0) {
          setQuickReplies(result.quickReplies)
        }
      } catch (error) {
        console.error("Error sending async message:", error)
        addMessage(
          "দুঃখিত, সংযোগে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন। (Sorry, I'm having trouble connecting. Please try again.)",
          "bot",
        )
      } finally {
        setTyping(false)
      }
    },
    [addMessage, setTyping, setQuickReplies, sessionId, currentSessionId, state.messages],
  )

  /**
   * Send message using sync endpoint (for desktop/web)
   */
  const sendMessageSync = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      // Add user message immediately to UI
      addMessage(content.trim(), "user")
      setTyping(true)

      try {
        const apiUrl = getApiUrl()
        if (!apiUrl) {
          throw new Error("API_URL is not configured")
        }

        // Convert current messages (before adding new user message) to conversation history
        // This ensures we send previous messages only, not the current one
        const conversationHistory = convertToApiMessages(state.messages)

        const requestBody: ChatRequest = {
          message: content.trim(),
          timestamp: new Date().toISOString(),
          sessionId: sessionId || currentSessionId || `session-${Date.now()}`,
          conversationHistory: conversationHistory, // Send conversation history
        }

        const response = await fetch(`${apiUrl}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data: ChatResponse = await response.json()

        // Add bot response to UI
        const responseText = data.response || ""
        addMessage(responseText, "bot", {
          citations: data.citations || undefined,
          helplines: data.helplines || undefined,
          is_emergency: data.is_emergency,
        })

        if (data.quickReplies && data.quickReplies.length > 0) {
          setQuickReplies(data.quickReplies)
        }
      } catch (error) {
        console.error("Error sending message:", error)
        addMessage(
          "দুঃখিত, সংযোগে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন। (Sorry, I'm having trouble connecting. Please try again.)",
          "bot",
        )
      } finally {
        setTyping(false)
      }
    },
    [addMessage, setTyping, setQuickReplies, sessionId, currentSessionId, state.messages],
  )

  /**
   * Main send message function
   * Automatically chooses between sync and async based on device type
   */
  const sendMessage = useCallback(
    async (content: string) => {
      // Use async endpoint for mobile devices to handle app switching
      if (isMobileDevice()) {
        return sendMessageAsync(content)
      } else {
        return sendMessageSync(content)
      }
    },
    [sendMessageAsync, sendMessageSync],
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
