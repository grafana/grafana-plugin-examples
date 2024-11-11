const express = require('express');
const app = express();
const port = 10000;


app.options('/metrics', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.send();
});
app.get('/metrics', (req, res) => {
  const pointsN = 1024;
  const dataPoints = [];
  const multiplier = parseInt(req.query.multiplier, 10) || 1;

  for (let i = 0; i < pointsN; i++) {
    const ts = new Date(Date.now() - i * 1000);
    dataPoints.push({
      time: ts,
      value: Math.sin(ts.getTime() / 10000) * multiplier,
    });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(JSON.stringify({ dataPoints }));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('error');
});

app.listen(port, () => {
  console.log(`Service listening at http://localhost:${port}`);
});
