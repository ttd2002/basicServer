const WebSocket = require('ws');
const express = require('express');
const app = express();
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        const clientId = message.toString(); 
        ws.id = clientId;
        console.log('Assigned clientId:', ws.id);
    });

});

app.server = app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

app.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

app.get('/', (req, res) => {
    const authCode = req.query.code;
    const targetClientId = req.query.state; 
    console.log('Received authCode:', authCode);
    console.log('Target Client ID:', targetClientId);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.id === targetClientId) {
            client.send(authCode);
        }
    });

    res.send('Authorization code sent to Unity!');
});
