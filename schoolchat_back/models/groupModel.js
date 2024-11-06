const { dynamoDB } = require('../config/config');
const { dynamo } = require('../config/config');

const tableName = 'Groups';

const params = {
  TableName: tableName,
  KeySchema: [
    { AttributeName: 'groupId', KeyType: 'HASH' } // Clave primaria
  ],
  AttributeDefinitions: [
    { AttributeName: 'groupId', AttributeType: 'S' },
    { AttributeName: 'inviteCode', AttributeType: 'S' } // Para el índice
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'InviteCodeIndex',
      KeySchema: [
        { AttributeName: 'inviteCode', KeyType: 'HASH' }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
  ]
};

// Función para crear la tabla si no existe
const createTableIfNotExists = async () => {
  try {
    const data = await dynamo.listTables().promise();
    if (!data.TableNames.includes(tableName)) {
      console.log(`Tabla ${tableName} no existe. Creando...`);
      await dynamo.createTable(params).promise();
      console.log(`Tabla ${tableName} creada.`);
    } else {
      console.log(`Tabla ${tableName} ya existe.`);
    }
  } catch (err) {
    console.error("Error verificando o creando la tabla:", err);
  }
};

// Llama a esta función al inicio de tu aplicación
createTableIfNotExists();

const Group = {
  create: async (group) => {
    const params = {
      TableName: 'Groups',
      Item: group
    };
    try {
      await dynamoDB.put(params).promise();
      console.log('Grupo creado:', group);
    } catch (error) {
      console.error('Error al crear grupo:', error);
      throw error;
    }
  },

  findById: async (groupId) => {
    const params = {
      TableName: 'Groups',
      Key: { groupId }
    };
    try {
      const result = await dynamoDB.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error('Error al buscar grupo por ID:', error);
      throw error;
    }
  },

  findByInviteCode: async (inviteCode) => {
    const params = {
      TableName: 'Groups',
      IndexName: 'InviteCodeIndex',
      KeyConditionExpression: 'inviteCode = :inviteCode',
      ExpressionAttributeValues: {
        ':inviteCode': inviteCode
      }
    };
    try {
      const result = await dynamoDB.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error('Error al buscar grupo por código de invitación:', error);
      throw error;
    }
  },

  update: async (groupId, updateValues) => {
    const params = {
      TableName: 'Groups',
      Key: { groupId },
      UpdateExpression: 'set ' + Object.keys(updateValues).map((key, idx) => `#${key} = :${key}`).join(', '),
      ExpressionAttributeNames: Object.keys(updateValues).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
      ExpressionAttributeValues: Object.keys(updateValues).reduce((acc, key) => ({ ...acc, [`:${key}`]: updateValues[key] }), {}),
      ReturnValues: 'UPDATED_NEW'
    };
    try {
      const result = await dynamoDB.update(params).promise();
      // console.log('Grupo actualizado:', result);
      return result;
    } catch (error) {
      // console.error('Error al actualizar grupo:', error);
      throw error;
    }
  },

  deleteById: async (groupId) => {
    const params = {
      TableName: 'Groups',
      Key: { groupId }
    };
    try {
      await dynamoDB.delete(params).promise();
      console.log('Grupo eliminado:', groupId);
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      throw error;
    }
  },

  listAll: async () => {
    const params = {
      TableName: 'Groups'
    };
    try {
      const result = await dynamoDB.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error('Error al listar grupos:', error);
      throw error;
    }
  },

  findByUserId: async (userId) => {
    const params = {
      TableName: 'Groups',
      FilterExpression: 'contains(members, :userId)',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    try {
      const result = await dynamoDB.scan(params).promise();
      // Extraer groupId de cada grupo encontrado
      const groupsWithIds = result.Items.map(group => ({
        groupId: group.groupId,
        name: group.name, // puedes incluir otros atributos si lo deseas
        photoUrl: group.photoUrl,
        inviteCode: group.inviteCode,
        createdBy: group.createdBy,
        members: group.members,
        channels: group.channels || [], // Agregar canales
        admins: group.admins || [] // Agregar administradores
      }));

      return groupsWithIds;
    } catch (error) {
      console.error('Error al buscar grupos por ID de usuario:', error);
      throw error;
    }
  },

  usersInGroup: async (groupId) => {
    const params = {
      TableName: 'Groups',
      Key: { groupId },
      ProjectionExpression: 'members'
    };
    try {
      const result = await dynamoDB.get(params).promise();
      return result.Item.members;
    } catch (error) {
      console.error('Error al obtener usuarios en grupo:', error);
      throw error;
    }
  }
};

module.exports = Group;
