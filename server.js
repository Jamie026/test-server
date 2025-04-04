require('dotenv').config();
const app = require('./app');
const WebSocket = require('ws');
const { getData } = require('./src/services/WebSocketService'); // Ya es una instancia

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT);

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write('data: Hola cliente 👋\n\n');

    const interval = setInterval(() => {
        res.write(`data: Actualización: ${new Date().toISOString()}\n\n`);
    }, 3000);

    req.on('close', () => clearInterval(interval));
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