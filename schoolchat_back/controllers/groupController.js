const { v4: uuidv4 } = require('uuid');
const Group = require('../models/groupModel');
const User = require('../models/userModel');
const Channel = require('../models/channelModel');
const { getWss } = require('../middlewares/websocket');
const WebSocket = require('ws');

exports.createGroup = async (req, res) => {
  const { name, photoUrl } = req.body;
  const userId = req.userId; // Obtenido del middleware de autenticación
  const inviteCode = uuidv4(); // Generar un código de invitación único

  const group = {
    groupId: uuidv4(),
    name,
    photoUrl,
    inviteCode,
    createdBy: userId,
    members: [userId],
    admins: [userId]
  };

  const channel = {
    channelId: uuidv4(),
    groupId: group.groupId,
    name: 'General', 
    description: 'Canal por defecto para el grupo'
  };

  try {
    // Crear el grupo
    await Group.create(group);

    // Crear el canal por defecto
    await Channel.create(channel);

    res.status(201).json({ message: 'Grupo y canal por defecto creados', group, channel });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear grupo y canal', error });
  }
};

exports.joinGroup = async (req, res) => {
  const { inviteCode } = req.body;
  const userId = req.userId;

  try {
    const groups = await Group.findByInviteCode(inviteCode);
    if (groups.length === 0) {
      return res.status(404).json({ message: 'Código de invitación inválido' });
    }

    const group = groups[0];
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'Ya eres miembro de este grupo' });
    }

    group.members.push(userId);
    await Group.update(group.groupId, { members: group.members });
    
    const wss = getWss();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        const modifiedGroup = { ...group, type: 'user-joined' };
        client.send(JSON.stringify(modifiedGroup));
      }
    });    

    res.status(200).json({ message: 'Te has unido al grupo', group });
  } catch (error) {
    res.status(500).json({ message: 'Error al unirse al grupo', error });
  }
};

exports.getGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener grupo', error });
  }
};

exports.getGroupsByUserId = async (req, res) => {
  const userId = req.userId;

  try {
    const groups = await Group.findByUserId(userId);
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener grupos', error });
  }
};

exports.getGroupByInviteCode = async (req, res) => {
  const { inviteCode } = req.params;

  try {
    const groups = await Group.findByInviteCode(inviteCode);
    if (groups.length === 0) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }
    res.status(200).json(groups[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener grupo', error });
  }
};

exports.listAllGroups = async (req, res) => {
  try {
    const groups = await Group.listAll();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener grupos', error });
  }
};

exports.updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const updateValues = req.body;

  try {
    const group = await Group.update(groupId, updateValues);
    res.status(200).json({ message: 'Grupo actualizado', group });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar grupo', error });
  }
};

exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    await Group.deleteById(groupId);
    res.status(200).json({ message: 'Grupo eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar grupo', error });
  }
};

exports.getUsersInGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const users = await Group.usersInGroup(groupId);
    res.status(200).json(users);
  }
  catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios del grupo', error });
  }
}

exports.kickUserFromGroup = async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    console.log('groupId:', groupId);
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }

    if (group.createdBy === userId) {
      return res.status(400).json({ message: 'No puedes expulsar al creador del grupo' });
    }

    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: 'El usuario no es miembro del grupo' });
    }

    group.members = group.members.filter(memberId => memberId !== userId);
    await Group.update(groupId, { members: group.members });

    const wss = getWss();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        const modifiedGroup = { ...group, type: 'user-left' };
        client.send(JSON.stringify(modifiedGroup));
      }
    });

    res.status(200).json({ message: 'Usuario expulsado del grupo' });
  } catch (error) {
    console.log('Error al expulsar usuario:', error);
    res.status(500).json({ error });
  }
}