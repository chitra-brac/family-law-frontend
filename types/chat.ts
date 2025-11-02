/**
 * API Types for Chat System
 * These types match the backend API contract
 */

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface LegalCitation {
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

export interface ChatRequest {
  message: string
  sessionId?: string
  timestamp?: string
  conversationHistory?: ChatMessage[]
}

export interface ChatResponse {
  response: string
  citations: LegalCitation[] | null
  is_emergency: boolean
  helplines: Helpline[] | null
  quickReplies: string[] | null
}

export interface AsyncChatResponse {
  requestId: string
  status: "pending"
  message: string
}

export interface ChatStatusResponse {
  requestId: string
  status: "pending" | "completed" | "error"
  result: ChatResponse | null
  error: string | null
}
