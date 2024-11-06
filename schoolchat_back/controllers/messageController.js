const Message = require('../models/messageModel');
const { v4: uuidv4 } = require('uuid');
const { getWss } = require('../middlewares/websocket');
const WebSocket = require('ws');

const createMessage = async (req, res) => {
  const { groupId, channelId, userId, username, avatar, text, imageUrl } = req.body;
  const timestamp = new Date().toISOString();
  const messageId = uuidv4();

  if (!channelId || channelId.trim() === '') {
    return res.status(400).send({ error: 'El channelId no puede estar vacío' });
  }

  const message = {
    messageId,
    groupId,
    channelId,
    userId,
    username,
    avatar,
    text,
    imageUrl: imageUrl || null, // Incluir imageUrl si está presente
    timestamp
  };

  try {
    await Message.create(message);

    const wss = getWss();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        const modifiedMessage = { ...message, type: 'message' };
        client.send(JSON.stringify(modifiedMessage));
      }
    });

    res.status(201).send({ message: 'Mensaje creado.', message });
  } catch (error) {
    res.status(500).send({ error: 'Error al crear el mensaje. Razón: ' + error.message });
  }
};

const getMessagesByChannel = async (req, res) => {
  const { channelId } = req.params;

  try {
    const result = await Message.findByChannel(channelId);
    res.status(200).send(result.Items);
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener mensajes. Razón: ' + error.message });
  }
};

const getMessagesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await Message.findByUser(userId);
    res.status(200).send(result.Items);
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener mensajes. Razón: ' + error.message });
  }
};

module.exports = {
  createMessage,
  getMessagesByChannel,
  getMessagesByUser
};
