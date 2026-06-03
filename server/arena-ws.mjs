import crypto from "node:crypto";
import http from "node:http";

const PORT = Number(process.env.ARENA_WS_PORT || 8099);
const clients = new Map();

function send(socket, data) {
  if (socket.destroyed) return;
  const payload = Buffer.from(JSON.stringify(data));
  const frame = Buffer.alloc(payload.length < 126 ? 2 : 4);
  frame[0] = 0x81;
  if (payload.length < 126) {
    frame[1] = payload.length;
  } else {
    frame[1] = 126;
    frame.writeUInt16BE(payload.length, 2);
  }
  socket.write(Buffer.concat([frame, payload]));
}

function broadcast(data, exceptId = "") {
  for (const [id, client] of clients) {
    if (id !== exceptId) send(client.socket, data);
  }
}

function parseFrames(buffer) {
  const messages = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const second = buffer[offset + 1];
    let length = second & 0x7f;
    let header = 2;
    if (length === 126) {
      if (offset + 4 > buffer.length) break;
      length = buffer.readUInt16BE(offset + 2);
      header = 4;
    }
    if (length === 127) return { messages, rest: Buffer.alloc(0) };
    const masked = (second & 0x80) !== 0;
    const maskOffset = offset + header;
    const dataOffset = maskOffset + (masked ? 4 : 0);
    if (dataOffset + length > buffer.length) break;
    const payload = Buffer.from(buffer.subarray(dataOffset, dataOffset + length));
    if (masked) {
      const mask = buffer.subarray(maskOffset, maskOffset + 4);
      for (let i = 0; i < payload.length; i += 1) payload[i] ^= mask[i % 4];
    }
    messages.push(payload.toString("utf8"));
    offset = dataOffset + length;
  }
  return { messages, rest: buffer.subarray(offset) };
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end("Yana Arena WebSocket server\n");
});

server.on("upgrade", (req, socket) => {
  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }
  const accept = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
      "Upgrade: websocket\r\n" +
      "Connection: Upgrade\r\n" +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );

  const id = crypto.randomUUID().slice(0, 8);
  const client = { id, socket, rest: Buffer.alloc(0), state: null };
  clients.set(id, client);
  send(socket, { type: "welcome", id, peers: [...clients.values()].filter((item) => item.id !== id).map((item) => item.state).filter(Boolean) });
  broadcast({ type: "join", id }, id);

  socket.on("data", (chunk) => {
    const parsed = parseFrames(Buffer.concat([client.rest, chunk]));
    client.rest = parsed.rest;
    for (const raw of parsed.messages) {
      try {
        const message = JSON.parse(raw);
        if (message.type === "state") {
          client.state = {
            type: "peer",
            id,
            name: String(message.name || "Игрок").slice(0, 24),
            x: Number(message.x) || 0,
            y: Number(message.y) || 0,
            z: Number(message.z) || 0,
            yaw: Number(message.yaw) || 0,
            hp: Number(message.hp) || 100,
            score: Number(message.score) || 0,
            firing: Boolean(message.firing),
            t: Date.now()
          };
          broadcast(client.state, id);
        }
      } catch {
        // Ignore malformed client messages.
      }
    }
  });

  socket.on("close", () => {
    clients.delete(id);
    broadcast({ type: "leave", id });
  });
  socket.on("error", () => {
    clients.delete(id);
    broadcast({ type: "leave", id });
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Arena WebSocket server listening on 127.0.0.1:${PORT}`);
});
