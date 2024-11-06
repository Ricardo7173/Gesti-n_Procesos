const { dynamoDB } = require('../config/config');
const { dynamo } = require('../config/config');

const tableName = 'Messages';

const params = {
  TableName: tableName,
  KeySchema: [
    { AttributeName: 'messageId', KeyType: 'HASH' } // Clave primaria
  ],
  AttributeDefinitions: [
    { AttributeName: 'messageId', AttributeType: 'S' },
    { AttributeName: 'channelId', AttributeType: 'S' }, // Para el índice
    { AttributeName: 'userId', AttributeType: 'S' } // Para el índice
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'MessagesByChannel',
      KeySchema: [
        { AttributeName: 'channelId', KeyType: 'HASH' }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    },
    {
      IndexName: 'MessagesByUser',
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' }
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

const Message = {
    
  create: (message) => {
    const params = {
      TableName: 'Messages',
      Item: message
    };
    return dynamoDB.put(params).promise();
  },

  findByChannel: (channelId) => {
    const params = {
      TableName: 'Messages',
      IndexName: 'MessagesByChannel',
      KeyConditionExpression: 'channelId = :channelId',
      ExpressionAttributeValues: {
        ':channelId': channelId
      }
    };
    return dynamoDB.query(params).promise();
  },

  findByUser: (userId) => {
    const params = {
      TableName: 'Messages',
      IndexName: 'MessagesByUser',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    return dynamoDB.query(params).promise();
  }
};

module.exports = Message;
