require('dotenv').config();
const app = require('./app');
const { getData } = require('./src/services/WebSocketService');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT);
app.use(cors());

let clients = [];

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