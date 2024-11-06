const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


// Rutas de autenticación
router.post('/register', authController.register);
router.post('/verify-token', authController.verifyToken);
router.post('/complete-registration', authController.completeRegistration);
router.post('/login', authController.login);
router.get('/user', authController.getUserInfo);
router.get('/user/:idUser', authController.getUserInfoById);


module.exports = router;