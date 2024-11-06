const { dynamoDB } = require('../config/config');
const { dynamo } = require('../config/config');

const tableName = 'Users';

const params = {
  TableName: tableName,
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH' } // Clave primaria
  ],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'email', AttributeType: 'S' } // Para el índice
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'EmailIndex',
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' }
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

const User = {
  create: async (user) => {
    const params = {
      TableName: 'Users',
      Item: user
    };
    try {
      await dynamoDB.put(params).promise();
    } catch (error) {
      throw error;
    }
  },

  update: async (userId, updateValues) => {
    const params = {
      TableName: 'Users',
      Key: { userId },
      UpdateExpression: 'set ' + Object.keys(updateValues).map((key, idx) => `#${key} = :${key}`).join(', '),
      ExpressionAttributeNames: Object.keys(updateValues).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
      ExpressionAttributeValues: Object.keys(updateValues).reduce((acc, key) => ({ ...acc, [`:${key}`]: updateValues[key] }), {}),
      ReturnValues: 'UPDATED_NEW'
    };
    try {
      const result = await dynamoDB.update(params).promise();
      console.log('Usuario actualizado:', result);
      return result;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  findById: async (userId) => {
    const params = {
      TableName: 'Users',
      Key: { userId }
    };
    try {
      const result = await dynamoDB.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  },

  findByEmail: async (email) => {
    const params = {
      TableName: 'Users',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :e',
      ExpressionAttributeValues: {
        ':e': email
      }
    };
    try {
      const result = await dynamoDB.query(params).promise();
      console.log('Usuario encontrado por email:', result);
      return result;
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw error;
    }
  },

  deleteIncomplete: async (twoDaysAgo) => {
    const params = {
      TableName: 'Users',
      FilterExpression: 'complete = :c and registrationTime < :time',
      ExpressionAttributeValues: {
        ':c': false,
        ':time': twoDaysAgo
      }
    };
    try {
      const result = await dynamoDB.scan(params).promise();
      console.log('Usuarios incompletos encontrados:', result);
      return result;
    } catch (error) {
      console.error('Error al buscar usuarios incompletos:', error);
      throw error;
    }
  },

  deleteById: async (userId) => {
    const params = {
      TableName: 'Users',
      Key: { userId }
    };
    try {
      await dynamoDB.delete(params).promise();
      console.log('Usuario eliminado:', userId);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
};

module.exports = User;
