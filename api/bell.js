const rooms = globalThis.__goodpet_rooms || (globalThis.__goodpet_rooms = new Map());

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const rawRoom = (req.query.room || "default").toString();
  const room = rawRoom.toLowerCase().replace(/[^a-z0-9]/g, "") || "default";

  if (!rooms.has(room)) {
    rooms.set(room, { count: 0, joined: false, updatedAt: Date.now() });
  }

  const state = rooms.get(room);

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? req.body.trim() : "";
    if (body === "HELLO") {
      state.joined = true;
      state.updatedAt = Date.now();
    } else if (body.startsWith("RING:")) {
      const amount = Math.max(1, Math.min(10000, parseInt(body.slice(5), 10) || 1));
      state.count += amount;
      state.updatedAt = Date.now();
    } else if (body === "RING") {
      state.count += 1;
      state.updatedAt = Date.now();
    }
    return res.status(200).json({ ok: true, room, count: state.count, joined: state.joined });
  }

  return res.status(200).json({ room, count: state.count, joined: state.joined });
}
