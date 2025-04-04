require('dotenv').config();
const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
    path: '/socket.io', // Especifica la ruta correcta para Socket.IO
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
