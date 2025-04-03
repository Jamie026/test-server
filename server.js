require('dotenv').config();
const app = require('./app');
const WebSocket = require('ws');
const { instance, getData } = require('./src/services/WebSocketService'); // Ya es una instancia

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log("Corriendo...");
});

// Configurar WebSocket Server
const wss = new WebSocket.Server({ server });

// Manejo de conexiones WebSocket
wss.on('connection', (ws, req) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    instance.addClient(clientId, ws);

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

    } catch (e) {
    }

    // Enviar datos iniciales al conectar
    instance.getCurrentData().then(data => {
        if (data && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'initial', data }));
        }
    });

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message.toString());
        } catch (error) {
        }
    });

    ws.on('close', () => {
        instance.removeClient(clientId);
    });

    ws.on('error', (error) => {
    });
});

app.post("/notify", async (req, res) => {
    try {
        console.log("Notificación recibida.");
        const newData = await getData();
        instance.broadcastToAll({ type: 'update', data: newData });
        res.send({ message: 'Ok'})
    } catch (error) {
    }
})

module.exports = { app, server };