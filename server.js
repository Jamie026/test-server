require('dotenv').config();
const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const { getData, instance } = require('./src/services/WebSocketService'); // Ya es una instancia

const PORT = process.env.PORT || 5000;

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar socket.io
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",  // Permite que el cliente desde localhost:3000 se conecte
        methods: ["GET", "POST"],  // Permite métodos GET y POST
        credentials: true // Si usas cookies o sesiones, habilita esto
    }
});

// Manejo de conexiones con socket.io
io.on('connection', (socket) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Nuevo cliente conectado: ${clientId}`);

    // Agregar cliente al sistema
    instance.addClient(clientId, socket);

    // Enviar datos iniciales al conectar
    instance.getCurrentData().then(data => {
        if (socket.connected) {
            socket.emit('initial', { type: 'initial', data });
        }
    });

    // Manejar mensajes recibidos de clientes
    socket.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            // Aquí puedes manejar el mensaje como desees
        } catch (error) {
            console.error('Error al procesar mensaje:', error);
        }
    });

    // Manejar desconexión de cliente
    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${clientId}`);
        instance.removeClient(clientId);
    });

    // Manejar errores de conexión
    socket.on('error', (error) => {
        console.error('Error de conexión:', error);
    });
});

// Configuración de endpoint para notificación
app.post("/notify", async (req, res) => {
    try {
        console.log("Notificación recibida.");
        const newData = await getData();
        instance.broadcastToAll({ type: 'update', data: newData });
        res.send({ message: 'Ok' });
    } catch (error) {
        console.error('Error en la notificación:', error);
        res.status(500).send({ message: 'Error al procesar la notificación' });
    }
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});