const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

console.log("Server running on 8080");

wss.on("connection", (ws) => {
  console.log("Connection opened");

  ws.on("close", () => {
    console.log("Connection closed");
    clearTimeout(ws.timeoutId);
  });

  ws.on("message", (data) => {
    const msg = JSON.parse(data);

    if (
      msg.lowerLimit === undefined ||
      msg.upperLimit === undefined ||
      msg.lowerLimit > msg.upperLimit
    ) {
      return;
    }
    let lowerLimit = parseFloat(msg.lowerLimit);
    let upperLimit = parseFloat(msg.upperLimit);

    sendData(ws, upperLimit, lowerLimit);
  });
});

function sendData(ws, lowerLimit = 0, upperLimit = 1) {
  // Send a random value.
  const value = Math.random() * (upperLimit - lowerLimit) + lowerLimit;

  ws.send(JSON.stringify({ time: Date.now(), value }));

  // Wait up to a second before sending the next value.
  ws.timeoutId = setTimeout(() => {
    sendData(ws, lowerLimit, upperLimit);
  }, Math.random() * 1000);
}
