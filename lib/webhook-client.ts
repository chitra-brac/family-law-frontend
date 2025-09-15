export interface WebhookRequest {
  message: string
  timestamp: string
  sessionId: string
  userId?: string
  metadata?: Record<string, any>
}

export interface WebhookResponse {
  response: string
  quickReplies?: string[]
  metadata?: Record<string, any>
  error?: string
}

export class WebhookClient {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl: string, timeout = 10000) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  async sendMessage(request: WebhookRequest): Promise<WebhookResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data as WebhookResponse
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout - please try again")
        }
        throw new Error(`Network error: ${error.message}`)
      }

      throw new Error("Unknown error occurred")
    }
  }

  // Test webhook connectivity
  async testConnection(): Promise<boolean> {
    try {
      const testRequest: WebhookRequest = {
        message: "test",
        timestamp: new Date().toISOString(),
        sessionId: "test-session",
      }

      await this.sendMessage(testRequest)
      return true
    } catch {
      return false
    }
  }
}

// Factory function for creating webhook client
export function createWebhookClient(url?: string): WebhookClient | null {
  if (!url) return null

  try {
    new URL(url) // Validate URL format
    return new WebhookClient(url)
  } catch {
    console.error("Invalid webhook URL provided")
    return null
  }
}
