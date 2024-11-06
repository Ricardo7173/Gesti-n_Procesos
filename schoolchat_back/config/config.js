const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
  region: 'us-west-2', // Cambia esto a tu región
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamo = new AWS.DynamoDB({
  endpoint: 'http://db:8000' // Asegúrate de que esta URL es correcta
});

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  endpoint: 'http://db:8000'
});

module.exports = {
  dynamoDB,
  dynamo,
  jwtSecret: process.env.JWT_SECRET
};