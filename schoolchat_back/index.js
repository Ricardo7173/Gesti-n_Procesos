const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes');
const channelRoutes = require('./routes/channelsRoutes');
require('dotenv').config();
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http');
const app = express();
const WebSocket = require('ws');
const { setWss } = require('./middlewares/websocket');
const path = require('path');

let wss;

// Configuración de orígenes permitidos para CORS
const allowedOrigins = [
  'https://localhost:4200',
  'http://localhost:4200',
  'http://localhost:3000',
  'https://localhost:3000',
  'https://18.222.28.159',
  'https://ec2-18-222-28-159.us-east-2.compute.amazonaws.com',
  'https://18.222.28.159:3000',
  'http://localhost:80',
  'http://localhost',
  'localhost'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Configuración de CORS
app.use(cors(corsOptions));

// Middleware para asegurar que todas las respuestas tengan las cabeceras necesarias
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Middleware de registro de peticiones para depuración
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(bodyParser.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/channels', channelRoutes);

const PORT = process.env.PORT || 3000;

try {
  // Configuración para servidor HTTPS
  const privateKey = fs.readFileSync('/etc/nginx/ssl/nginx.key', 'utf8');
  const certificate = fs.readFileSync('/etc/nginx/ssl/nginx.crt', 'utf8');

  const options = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(options, app);

  httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server is running on port ${PORT}`);
  });

  wss = new WebSocket.Server({ server: httpsServer });
  wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('error', console.error);
    ws.on('close', () => console.log('Client disconnected'));
  });

  setWss(wss);
} catch (e) {
  console.log('\x1b[33m%s\x1b[0m', 'No se pudo crear un servidor HTTPS, se usará HTTP');

  const httpServer = http.createServer(app);
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  wss = new WebSocket.Server({ server: httpServer });
  wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('error', console.error);
    ws.on('close', () => console.log('Client disconnected'));
  });

  setWss(wss);
}
