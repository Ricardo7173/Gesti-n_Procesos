// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, groupController.createGroup);
router.post('/join', authMiddleware, groupController.joinGroup);
router.get('/:groupId', authMiddleware, groupController.getGroup);
router.get('/', groupController.listAllGroups);
router.put('/:groupId', authMiddleware, groupController.updateGroup);
router.delete('/:groupId', authMiddleware, groupController.deleteGroup);
router.get('/user/groups', authMiddleware, groupController.getGroupsByUserId);
router.get('/invite/:inviteCode', authMiddleware, groupController.getGroupByInviteCode);
router.get('/:groupId/users', groupController.getUsersInGroup);
router.delete('/:groupId/kick/:userId', authMiddleware, groupController.kickUserFromGroup);

module.exports = router;
