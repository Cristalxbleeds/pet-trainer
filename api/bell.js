// tiny in-memowy weway wunning diwectwy on vewcew :3
const rooms = {};

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const room = (req.query && req.query.room) || "default";
  if (!rooms[room]) {
    rooms[room] = { count: 0, joined: false };
  }

  // adc sends a wing ow hewwo signaw :3
  if (req.method === "POST") {
    const body = req.body || "";
    if (body === "RING") {
      rooms[room].count += 1;
      console.log("beww wung in woom: " + room + " :3");
    } else if (body === "HELLO") {
      rooms[room].joined = true;
      console.log("adc joined woom: " + room + " :3");
    }
    return res.status(200).json(rooms[room]);
  }

  // suppowt checks fow new wings :3
  return res.status(200).json(rooms[room]);
}
