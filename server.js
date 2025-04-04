require('dotenv').config();
const app = require('./app');
const { getData } = require('./src/services/WebSocketService');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT);
app.use(cors());

app.get('/events', (req, res) => {
    // CORS headers:
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); 
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write('data: Hola cliente 👋\n\n');

    const interval = setInterval(() => {
        res.write(`data: Actualización: ${new Date().toISOString()}\n\n`);
    }, 3000);

    req.on('close', () => clearInterval(interval));
});


module.exports = { app, server };