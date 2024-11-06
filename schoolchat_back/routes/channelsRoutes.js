const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', channelController.createChannel);
router.get('/group/:groupId', channelController.getChannelsByGroupId);
router.get('/:channelId', channelController.getChannelById);


module.exports = router;
