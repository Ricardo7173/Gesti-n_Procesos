const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');
const User = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');

const register = async (req, res) => {
  const { email, socialLogin } = req.body;
  const userId = uuidv4();
  const registrationTime = new Date().toISOString();

  const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '2d' }); // TODO: Notificar al usuario si su token expiro

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser.Items.length > 0) {
      return res.status(400).send({ error: 'El usuario ya existe.' });
    }

    await User.create({
      userId,
      email,
      socialLogin,
      registrationTime,
      complete: false
    });
    res.status(201).send({ message: 'Usuario creado.', token });
  } catch (err) {
    res.status(500).send({ err});
  }
};

const verifyToken = async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, jwtSecret);
    res.status(200).send({ userId: decoded.userId });
  } catch (error) {
    res.status(401).send({ error: 'Token invalido.' });
  }
}

const completeRegistration = async (req, res) => {
  const { userId, username, realName, avatar, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);

  try {
    await User.update(userId, { username, realName, avatar, password: hashedPassword, complete: true });
    const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
    res.status(200).send({ message: 'Registro completado.', token });
  } catch (error) {
    res.status(500).send({ error: 'Error al completar el registro. Razon: ' + error});
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await User.findByEmail(email);
    if (result.Items.length === 0 || !result.Items[0].complete) {
      return res.status(400).send({ error: 'Usuario no encontrado o registro incompleto.' });
    }

    const user = result.Items[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign({ userId: user.userId }, jwtSecret, { expiresIn: '1h' });
    res.status(200).send({ token });
  } catch (err) {
    res.status(500).send({ error: 'Error al iniciar sesión.', err  });
  }
};

const getUserInfo = async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.error('Token no proporcionado.');
    return res.status(401).send({ error: 'Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1]; // Suponiendo que el token viene en el formato "Bearer <token>"
  if (!token) {
    console.error('Token no proporcionado después de dividir el encabezado.');
    return res.status(401).send({ error: 'Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;
    // console.log('Token decodificado:', decoded);

    const user = await User.findById(userId);
    if (!user) {
      console.error('Usuario no encontrado para el ID:', userId);
      return res.status(404).send({ error: 'Usuario no encontrado.' });
    }

    // console.log('Usuario encontrado:', user);
    res.status(200).send({
      userId: user.userId,
      username: user.username,
      realName: user.realName,
      avatar: user.avatar,
      email: user.email
    });
  } catch (error) {
    console.error('Error en getUserInfo:', error);
    res.status(401).send({ error: 'Token inválido o expirado.' });
  }
};

const getUserInfoById = async (req, res) => {
  const { idUser } = req.params;

  try {
    const user = await User.findById(idUser);
    if (!user) {
      return res.status(404).send({ error: 'Usuario no encontrado.' });
    }
    
    res.status(200).send({
      userId: user.userId,
      username: user.username,
      realName: user.realName,
      avatar: user.avatar,
      email: user.email
    });
  }
  catch (error) {
    res.status(500).send({ error: 'Error al obtener información del usuario. Razon: ' + error });
  }
}


module.exports = {
  register,
  completeRegistration,
  verifyToken,
  login,
  getUserInfo,
  getUserInfoById
};