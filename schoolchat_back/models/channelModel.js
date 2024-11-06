const { dynamoDB } = require('../config/config');
const { dynamo } = require('../config/config');

const tableName = 'Channels';

const params = {
  TableName: tableName,
  KeySchema: [
    { AttributeName: 'channelId', KeyType: 'HASH' } // Clave primaria
  ],
  AttributeDefinitions: [
    { AttributeName: 'channelId', AttributeType: 'S' },
    { AttributeName: 'groupId', AttributeType: 'S' } // Para el índice
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'ChannelsByGroup',
      KeySchema: [
        { AttributeName: 'groupId', KeyType: 'HASH' }
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

const Channel = {
  create: async (channel) => {
    const params = {
      TableName: 'Channels',
      Item: channel
    };
    try {
      await dynamoDB.put(params).promise();
      console.log('Canal creado:', channel);
    } catch (error) {
      console.error('Error al crear canal:', error);
      throw error;
    }
  },

  findById: async (channelId) => {
    const params = {
      TableName: 'Channels',
      Key: { channelId }
    };
    try {
      const result = await dynamoDB.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error('Error al buscar canal por ID:', error);
      throw error;
    }
  },

  findByGroupId: async (groupId) => {
    const params = {
      TableName: 'Channels',
      IndexName: 'ChannelsByGroup',
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: {
        ':groupId': groupId
      }
    };
    try {
      const result = await dynamoDB.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error('Error al buscar canales por ID de grupo:', error);
      throw error;
    }
  },

  update: async (channelId, updateValues) => {
    const params = {
      TableName: 'Channels',
      Key: { channelId },
      UpdateExpression: 'set ' + Object.keys(updateValues).map((key, idx) => `#${key} = :${key}`).join(', '),
      ExpressionAttributeNames: Object.keys(updateValues).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
      ExpressionAttributeValues: Object.keys(updateValues).reduce((acc, key) => ({ ...acc, [`:${key}`]: updateValues[key] }), {}),
      ReturnValues: 'UPDATED_NEW'
    };
    try {
      const result = await dynamoDB.update(params).promise();
      console.log('Canal actualizado:', result);
      return result;
    } catch (error) {
      console.error('Error al actualizar canal:', error);
      throw error;
    }
  },

  deleteById: async (channelId) => {
    const params = {
      TableName: 'Channels',
      Key: { channelId }
    };
    try {
      await dynamoDB.delete(params).promise();
      console.log('Canal eliminado:', channelId);
    } catch (error) {
      console.error('Error al eliminar canal:', error);
      throw error;
    }
  },

  listByGroupId: async (groupId) => {
    const params = {
      TableName: 'Channels',
      IndexName: 'ChannelsByGroup',
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: {
        ':groupId': groupId
      }
    };
    try {
      const result = await dynamoDB.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error('Error al listar canales por ID de grupo:', error);
      throw error;
    }
  }
  
};

module.exports = Channel;
