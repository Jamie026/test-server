require('dotenv').config();
const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",  // Permite que el cliente desde localhost:3000 se conecte
        methods: ["GET", "POST"],  // Permite métodos GET y POST
        credentials: true // Si usas cookies o sesiones, habilita esto
    }
});

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar eventos, escuchar mensajes, etc.
    socket.on('message', (data) => {
        console.log('Mensaje recibido:', data);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
