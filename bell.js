// tiny in-memowy weway wunning diwectwy on vewcew :3
const rooms = {};

export default function handler(req, res) {
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
