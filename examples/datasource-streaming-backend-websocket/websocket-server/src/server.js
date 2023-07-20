const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

console.log("Server running on 8080");

wss.on("connection", (ws) => {
  console.log("Connection opened");
  let timeoutId;

  const sendData = () => {
    // Send a random value.
    ws.send(JSON.stringify({ time: Date.now(), value: Math.random() }));

    // Wait up to a second before sending the next value.
    timeoutId = setTimeout(sendData, Math.random() * 1000);
  };


  ws.on("close", () => {
    console.log("Connection closed");
    clearTimeout(timeoutId)
  })


  // Send the first value.
  sendData();
});
