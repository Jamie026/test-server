require('dotenv').config();
const app = require('./app');
const { getData } = require('./src/services/WebSocketService');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT);
app.use(cors());

let clients = {};  // Objeto para almacenar las conexiones activas por un identificador único, por ejemplo, userId

app.get('/events', (req, res) => {
    const userId = req.query.userId;  // Obtener el identificador único del cliente, por ejemplo, desde los parámetros de la URL
    if (!userId || clients[userId]) {
        // Si el cliente ya está registrado, cierra la conexión
        res.status(400).send('Ya tienes una conexión activa.');
        return;
    }

    // Registrar la nueva conexión
    clients[userId] = res;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('data: Hola cliente 👋');

    req.on('close', () => {
        delete clients[userId];  // Eliminar al cliente cuando se desconecte
    });
});


app.post("/notify", async (req, res) => {
    try {
        console.log("Notificación recibida.");
        const newData = await getData();
        console.log('🔄 Datos actualizados, enviando mensaje a los clientes...');

        // Envía los datos a todos los clientes conectados
        clients.forEach(client => {
            client.write(`data: ${JSON.stringify({ type: 'update', data: newData })}\n\n`);
        });

        res.send({ message: 'Ok' });
    } catch (error) {
        console.error("Error al procesar la notificación:", error);
        res.status(500).send({ error: 'Error al procesar la notificación' });
    }
});

module.exports = { app, server };