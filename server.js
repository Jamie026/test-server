require('dotenv').config();
const app = require('./app');
const { getData } = require('./src/services/realTimeService');
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

let clients = [];

// SSE para eventos en tiempo real
app.get('/events', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('data: Hola cliente 👋\n\n');

    clients.push(res);
    
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

// WebSockets
io.on('connection', (socket) => {
    console.log(`🔗 Cliente conectado: ${socket.id}`);

    socket.emit('message', { type: 'info', text: 'Bienvenido al servidor WebSocket!' });

    socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});

app.post("/notify", async (req, res) => {
    try {
        console.log("Notificación recibida.");
        const newData = await getData();
        console.log('🔄 Datos actualizados, enviando mensaje a los clientes...');

        // Enviar datos a clientes SSE
        clients.forEach(client => {
            client.write(`data: ${JSON.stringify({ type: 'update', data: newData })}\n\n`);
        });

        // Enviar datos a clientes WebSocket
        io.emit('update', { type: 'update', data: newData });

        res.send({ message: 'Ok' });
    } catch (error) {
        console.error("Error al procesar la notificación:", error);
        res.status(500).send({ error: 'Error al procesar la notificación' });
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = { app, server, io };