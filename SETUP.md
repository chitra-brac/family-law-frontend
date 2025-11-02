# Family Law Frontend Setup

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Backend URL

The `.env.local` file is already configured to point to `http://localhost:8000`.

If you need to change it, edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start the Development Server

```bash
npm run dev
# or
pnpm dev
```

The frontend will be available at: **http://localhost:3000**

## Connecting to Backend

### Step 1: Make sure the backend is running

In the `family-law-backend` directory:
```bash
python api.py
```

The backend should be running at `http://localhost:8000`

### Step 2: Configure webhook URL in the frontend

1. Open the app at http://localhost:3000
2. On the welcome screen, you'll see a webhook configuration
3. Enter: `http://localhost:8000/chat`
4. Click "Start Chat"

## Testing

Send a message like:
- "What are the laws regarding divorce in Bangladesh?"
- "বাংলাদেশে বিবাহ বিচ্ছেদ সংক্রান্ত আইন কী?"
- "Tell me about child custody laws"

The bot will search the family law database and return relevant sections.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│                 │         │                  │         │              │
│  Next.js        │ ──────> │  FastAPI         │ ──────> │  Pinecone    │
│  Frontend       │  HTTP   │  Backend         │  Query  │  Vector DB   │
│  (Port 3000)    │ <────── │  (Port 8000)     │ <────── │              │
│                 │ JSON    │                  │ Results │  1,989 docs  │
└─────────────────┘         └──────────────────┘         └──────────────┘
                                      │
                                      v
                            ┌──────────────────┐
                            │                  │
                            │  OpenAI API      │
                            │  text-embedding  │
                            │  -3-large        │
                            └──────────────────┘
```

## Features

- ✅ Real-time chat interface
- ✅ Bengali (Bangla) language support
- ✅ Chat history with session management
- ✅ Quick reply suggestions
- ✅ Typing indicators
- ✅ Dark/Light theme support
- ✅ RAG-powered responses from 1,989 family law sections

## API Endpoint

The frontend sends requests to: **POST /chat**

Request format:
```json
{
  "message": "User question here",
  "timestamp": "2025-11-01T12:00:00Z",
  "sessionId": "session-123456"
}
```

Response format:
```json
{
  "response": "Bot response with legal information",
  "quickReplies": ["Suggested reply 1", "Suggested reply 2"]
}
```

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
- Make sure the backend is running on port 8000
- Check that `.env.local` has the correct URL
- Restart both frontend and backend

### Backend not responding
- Check if the backend is running: `curl http://localhost:8000/health`
- Make sure Pinecone and OpenAI credentials are set in backend's `.env`
- Check backend logs for errors

### Frontend not connecting
- Clear your browser's localStorage
- Check the webhook URL is set to: `http://localhost:8000/chat`
- Restart the dev server: `npm run dev`
