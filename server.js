require('dotenv').config();
const app = require('./app');
const { getData, notifyBOT } = require('./src/services/realTimeService');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

// WebSockets
io.on('connection', async (socket) => {
    console.log(`🔗 Cliente conectado: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});

app.post("/notify", async (req, res) => {
    try {
        console.log("Notificación recibida.");
        const newData = await getData();
        console.log('🔄 Datos actualizados, enviando mensaje a los clientes...');

        // Enviar datos a todos los clientes WebSocket
        io.emit('update', { type: 'update', data: newData });

        res.send({ message: 'Ok' });
    } catch (error) {
        console.error("Error al procesar la notificación:", error);
        res.status(500).send({ error: 'Error al procesar la notificación' });
    }
});

// Iniciar servidors
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = { app, server, io };