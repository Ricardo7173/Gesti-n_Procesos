const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController')

// Rutas de mensajes
router.post('', messageController.createMessage);
router.get('/channel/:channelId', messageController.getMessagesByChannel);
router.get('/user/:userId', messageController.getMessagesByUser);

module.exports = router;