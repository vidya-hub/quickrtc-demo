# QuickRTC Demo

A simple video conferencing demo using QuickRTC.

## Architecture

```
┌────────────┐                                      ┌────────────┐
│  Client A  │                                      │  Client B  │
│   (Alice)  │                                      │   (Bob)    │
└─────┬──────┘                                      └──────┬─────┘
      │                                                    │
      │              ┌──────────────────┐                  │
      │   Socket.IO  │      Server      │   Socket.IO      │
      ├─────────────►│                  │◄──────────────── ┤
      │  (signaling) │  ┌────────────┐  │  (signaling)     │
      │              │  │ Conference │  │                  │
      │◄────────────►│  │ "room-123" │  │◄────────────────►
      │    WebRTC    │  └────────────┘  │    WebRTC        │
      │   (media)    │    Mediasoup     │   (media)        │
      │              └──────────────────┘                  │
      │                                                    │
      └────────────────── Media Flow ──────────────────────┘
```

## Setup

```bash
# Install
cd server && npm install
cd ../client && npm install

# Generate certs
cd server && npm run generate-certs

# Run (2 terminals)
cd server && npm run dev
cd client && npm run dev
```

Open https://localhost:5173

## Integration Steps

| Step | Snippet             | File               | Description                         |
| ---- | ------------------- | ------------------ | ----------------------------------- |
| 1    | `quickserver`       | server/index.ts    | Create and start QuickRTC server    |
| 2    | `createHook`        | client/src/App.tsx | Initialize useQuickRTC hook         |
| 3    | `addClientListener` | client/src/App.tsx | Subscribe to QuickRTC events        |
| 4    | `handlejoin`        | client/src/App.tsx | Join conference and produce streams |
| 5    | `handleleave`       | client/src/App.tsx | Leave conference and cleanup        |
