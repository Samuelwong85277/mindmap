const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// In-memory room storage (works on any cloud platform)
const rooms = new Map();

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// CORS for GitHub Pages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', rooms: rooms.size }));

// API: Create room
app.post('/api/rooms', (req, res) => {
  const { name, data } = req.body;
  const id = crypto.randomUUID();
  const code = generateCode();
  rooms.set(id, {
    id, code,
    name: name || '未命名',
    data: data || { id: 'root', title: '中心主题', children: [], collapsed: false },
    clients: new Set(),
    createdAt: Date.now()
  });
  res.json({ id, code });
});

// API: Get room by code
app.get('/api/rooms/code/:code', (req, res) => {
  for (const [id, room] of rooms) {
    if (room.code === req.params.code.toUpperCase()) {
      return res.json({ id, name: room.name });
    }
  }
  res.status(404).json({ error: '房间不存在' });
});

// API: Get room data
app.get('/api/rooms/:id', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ error: '房间不存在' });
  res.json({ id: room.id, code: room.code, name: room.name, data: room.data });
});

// WebSocket
wss.on('connection', (ws) => {
  let currentRoom = null;
  const userId = crypto.randomUUID().substring(0, 8);

  ws.send(JSON.stringify({ type: 'connected', userId }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      
      switch (msg.type) {
        case 'join': {
          if (currentRoom) {
            const old = rooms.get(currentRoom);
            if (old) old.clients.delete(ws);
          }
          currentRoom = msg.roomId;
          let room = rooms.get(currentRoom);
          if (!room) {
            room = {
              id: currentRoom,
              code: generateCode(),
              name: msg.name || '新房间',
              data: { id: 'root', title: '中心主题', children: [], collapsed: false },
              clients: new Set(),
              createdAt: Date.now()
            };
            rooms.set(currentRoom, room);
          }
          room.clients.add(ws);
          ws.send(JSON.stringify({
            type: 'joined',
            roomId: currentRoom,
            code: room.code,
            data: room.data,
            peers: room.clients.size
          }));
          broadcast(room, { type: 'peer-joined', peers: room.clients.size }, ws);
          break;
        }
        case 'update': {
          if (currentRoom) {
            const r = rooms.get(currentRoom);
            if (r) {
              r.data = msg.data;
              broadcast(r, { type: 'updated', data: msg.data, from: userId }, ws);
            }
          }
          break;
        }
      }
    } catch (e) {
      console.error('WS error:', e.message);
    }
  });

  ws.on('close', () => {
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.clients.delete(ws);
        broadcast(room, { type: 'peer-left', peers: room.clients.size }, ws);
        // Clean up empty rooms after 5 min
        if (room.clients.size === 0) {
          setTimeout(() => {
            const r = rooms.get(currentRoom);
            if (r && r.clients.size === 0) rooms.delete(currentRoom);
          }, 300000);
        }
      }
    }
  });
});

function broadcast(room, msg, exclude) {
  room.clients.forEach(client => {
    if (client !== exclude && client.readyState === 1) {
      client.send(JSON.stringify(msg));
    }
  });
}

// Auto-cleanup: remove rooms idle > 1 hour
setInterval(() => {
  const cutoff = Date.now() - 3600000;
  for (const [id, room] of rooms) {
    if (room.clients.size === 0 && room.createdAt < cutoff) {
      rooms.delete(id);
    }
  }
}, 600000);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🧠 Server running on port ${PORT}`);
});
