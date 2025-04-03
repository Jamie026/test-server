require('dotenv').config();
const app = require('./app');
const WebSocket = require('ws');
const logger = require('./src/utils/logger');
const { instance, getData } = require('./src/services/WebSocketService'); // Ya es una instancia

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`🚀 Servidor en http://localhost:${PORT}`);
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

        if (token) {
            logger.info(`Cliente ${clientId} conectado con token`);
        } else {
            logger.info(`Cliente ${clientId} conectado sin token`);
        }
    } catch (e) {
        logger.warn(`Cliente ${clientId} conectado con URL malformada: ${req.url}`);
    }

    // Enviar datos iniciales al conectar
    instance.getCurrentData().then(data => {
        if (data && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'initial', data }));
            logger.debug(`Datos iniciales enviados a ${clientId}`);
        }
    });

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message.toString());
            logger.debug(`Mensaje recibido de ${clientId}: ${JSON.stringify(parsedMessage)}`);
        } catch (error) {
            logger.error(`Error procesando mensaje de ${clientId}: ${error.message}`);
        }
    });

    ws.on('close', () => {
        instance.removeClient(clientId);
    });

    ws.on('error', (error) => {
        logger.error(`Error en WebSocket para ${clientId}: ${error.message}`);
    });
});

app.post("/notify", async (req, res) => {
    try {
        console.log("Notificación recibida.");
        const newData = await getData();
        logger.info('🔄 Datos actualizados, enviando mensaje a los clientes...');
        instance.broadcastToAll({ type: 'update', data: newData });
        res.send({ message: 'Ok'})
    } catch (error) {
        logger.error(error);
    }
})

module.exports = { app, server };