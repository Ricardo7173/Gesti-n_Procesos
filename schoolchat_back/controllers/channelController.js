const { v4: uuidv4 } = require('uuid');
const Channel = require('../models/channelModel');
const { getWss } = require('../middlewares/websocket');
const WebSocket = require('ws');

// Controlador para crear un canal
exports.createChannel = async (req, res) => {
  const { groupId, name } = req.body;

  const channel = {
    channelId: uuidv4(),
    groupId,
    name
  };

  try {
    await Channel.create(channel);

    const wss = getWss();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        const modifiedChannel = { ...channel, type: 'channel' };
        client.send(JSON.stringify(modifiedChannel));
      }
    });

    res.status(201).json({ message: 'Canal creado', channel });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear canal', error });
  }
};

// Controlador para obtener canales por ID de grupo
exports.getChannelsByGroupId = async (req, res) => {
  const { groupId } = req.params;
  // console.log(`Recibido groupId: ${groupId}`);

  try {
    const channels = await Channel.listByGroupId(groupId);
    // console.log(`Canales encontrados: ${channels}`);
    if (!channels) {
      return res.status(404).json({ message: 'No se encontraron canales para este grupo' });
    }
    res.status(200).json(channels);
  } catch (error) {
    console.error(`Error al obtener canales: ${error.message}`);
    res.status(500).json({ message: 'Error al obtener canales', error });
  }
};

exports.getChannelById = async (req, res) => {
  const { channelId } = req.params;

  try {
    const channel = await Channel.get(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Canal no encontrado' });
    }
    res.status(200).json(channel);
  } catch (error) {
    console.error(`Error al obtener canal: ${error.message}`);
    res.status(500).json({ message: 'Error al obtener canal', error });
  }
};

