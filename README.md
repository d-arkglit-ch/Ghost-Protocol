# Ghost Protocol: Real-Time Burner Chat

Ghost Protocol is a high-performance, anonymity-first chat application designed for ephemeral communication. Whether it's a timed "Burner Room" or a random "Stranger Match," Ghost Protocol ensures data remains private and connections stay fast.

---

## Core Features

### Anonymity & Privacy
- **Guest Access:** Join rooms as a guest with zero registration required.
- **Automated Cleanup:** Background service (cleanup.js) removes Guest accounts after 5 minutes of inactivity and registered users after 1 week.
- **Room Lifecycle:** Owners can instantly terminate rooms, triggering a real-time socket disconnect for all active participants.

### Real-Time Sockets
- **Direct Messaging:** Instant delivery with 0ms database latency during active chat.
- **Typing Indicators:** Feedback on active participation within the room.
- **Stranger Matching:** Pair with other users instantly using a server-side matchmaking queue.

### Performance Optimizations
- **In-Memory Socket Maps:** Bypasses MongoDB queries during messaging by caching verified room memberships in server RAM.
- **Cursor Pagination:** Supports high-volume chat history by fetching 50-message chunks via _id cursors.
- **Compound Indexing:** Optimized MongoDB queries using B-Tree indexes on lastActive and roomCode.

---

## Tech Stack

- **Frontend:** React, Vite, Framer Motion, Axios.
- **Backend:** Node.js, Express, Socket.io, JWT.
- **Database:** MongoDB (Mongoose).
- **Styling:** Vanilla CSS (Minimalist Terminal Aesthetic).

---

## Environment Setup

Create a .env file in the backend folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
CORS_ORIGIN=http://localhost:5173
```

---

## Installation and Execution

1. **Install Dependencies**
   ```bash
   # From root
   cd backend && npm install
   cd ../Frontend && npm install
   ```

2. **Run Backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Run Frontend**
   ```bash
   cd Frontend
   npm run dev
   ```

---

## License
Designed for ephemeral communication. Data persistence is not guaranteed.

[ DISCONNECT_FROM_PROXY ]
