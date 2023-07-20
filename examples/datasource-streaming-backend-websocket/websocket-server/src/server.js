const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

console.log("Server running on 8080");

wss.on("connection", (ws) => {
  console.log("Connection opened");
  let timeoutId;
  let lowerLimit = 0;
  let upperLimit = 1;

  const sendData = () => {
    // Send a random value.
    let value = Math.random() * (upperLimit - lowerLimit) + lowerLimit;
    ws.send(JSON.stringify({ time: Date.now(), value }));

    // Wait up to a second before sending the next value.
    timeoutId = setTimeout(sendData, Math.random() * 1000);
  };

  ws.on("close", () => {
    console.log("Connection closed");
    clearTimeout(timeoutId);
  });

  ws.on("message", (data) => {
    const msg = JSON.parse(data);
    if (!msg.lowerLimit || !msg.upperLimit || msg.lowerLimit > msg.upperLimit) {
      console.log(`Message out of format: ${data}`);
      return;
    }
    lowerLimit = parseFloat(msg.lowerLimit);
    upperLimit = parseFloat(msg.upperLimit);

    // Send the first value.
    sendData();
  });
});
