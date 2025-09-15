"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2 } from "lucide-react"
import { createWebhookClient } from "@/lib/webhook-client"

interface WebhookConfigProps {
  webhookUrl?: string
  onWebhookChange: (url: string) => void
}

export function WebhookConfig({ webhookUrl, onWebhookChange }: WebhookConfigProps) {
  const [tempUrl, setTempUrl] = useState(webhookUrl || "")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSave = () => {
    onWebhookChange(tempUrl)
    setConnectionStatus("idle")
  }

  const handleTestConnection = async () => {
    if (!tempUrl.trim()) return

    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      const client = createWebhookClient(tempUrl)
      if (!client) {
        setConnectionStatus("error")
        return
      }

      const isConnected = await client.testConnection()
      setConnectionStatus(isConnected ? "success" : "error")
    } catch {
      setConnectionStatus("error")
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">n8n Webhook Configuration</CardTitle>
        <CardDescription>
          Connect your chatbot to an n8n workflow with RAG pipeline for intelligent responses.
        </CardDescription>
        {webhookUrl && (
          <Badge variant="outline" className="w-fit">
            Connected
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <Input
            id="webhook-url"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="https://your-n8n-instance.com/webhook/chatbot"
            className="font-mono text-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={!tempUrl.trim() || isTestingConnection}
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>

          {connectionStatus === "success" && (
            <div className="flex items-center text-green-600 text-sm">
              <Check className="w-4 h-4 mr-1" />
              Connected
            </div>
          )}

          {connectionStatus === "error" && (
            <div className="flex items-center text-red-600 text-sm">
              <X className="w-4 h-4 mr-1" />
              Connection failed
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <strong>Expected n8n Response Format:</strong>
          <pre className="mt-1 font-mono">
            {JSON.stringify(
              {
                response: "Bot response message",
                quickReplies: ["Option 1", "Option 2"],
              },
              null,
              2,
            )}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
