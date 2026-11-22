// tiny in-memowy weway wunning diwectwy on netlify :3
const rooms = {};

exports.handler = async (event) => {
  const room = (event.queryStringParameters && event.queryStringParameters.room) || "default";
  if (!rooms[room]) {
    rooms[room] = { count: 0, joined: false };
  }

  // adc sends a wing ow hewwo signaw :3
  if (event.httpMethod === "POST") {
    const body = event.body || "";
    if (body === "RING") {
      rooms[room].count += 1;
      console.log("beww wung in woom: " + room + " :3");
    } else if (body === "HELLO") {
      rooms[room].joined = true;
      console.log("adc joined woom: " + room + " :3");
    }
    return { statusCode: 200, body: JSON.stringify(rooms[room]) };
  }

  // suppowt checks fow new wings :3
  return { statusCode: 200, body: JSON.stringify(rooms[room]) };
};
