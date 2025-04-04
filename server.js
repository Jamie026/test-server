require('dotenv').config();
const app = require('./app');
const { getData } = require('./src/services/WebSocketService');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT);
app.use(cors({
    origin: '*', // o el dominio que necesites
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

let clients = {};  // Objeto para almacenar las conexiones activas por un identificador único, por ejemplo, userId

app.get('/events', (req, res) => {
    console.log("userId recibido:");  // Agrega un log aquí para verificar
    if (!clients[res]) {
        res.status(400).send('Ya tienes una conexión activa.');
        return;
    }
    clients[res] = res;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('data: Hola cliente 👋');

    req.on('close', () => {
        delete clients[res];  // Eliminar al cliente cuando se desconecte
    });
});

app.post("/notify", async (req, res) => {
    try {
        console.log("Notificación recibida.");
        const newData = await getData();
        console.log('🔄 Datos actualizados, enviando mensaje a los clientes...');

        console.log(Object.keys(clients).length);
        
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