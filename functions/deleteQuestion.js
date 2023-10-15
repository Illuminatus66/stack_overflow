import jwt from "jsonwebtoken";
import { Client } from "cassandra-driver";
import dotenv from "dotenv";
import path from 'path';

dotenv.config();

const filePath = path.join(__dirname, '../secure-connect-stack-overflow.zip');

const keyspace = process.env.ASTRA_DB_KEYSPACE;
const questionsTable = process.env.ASTRA_DB_QUESTIONS;
const answersTable = process.env.ASTRA_DB_ANSWERS;

const auth = (handler) => async (event, context) => {
  try {
    const authorizationHeader = event.headers && event.headers.authorization;
    if (!authorizationHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify("Unauthorized: Missing authorization header"),
      };
    }

    const token = authorizationHeader.split(" ")[1];
    let decodeData = jwt.verify(token, process.env.JWT_SECRET);
    event.user_id = decodeData?.user_id;
    return await handler(event, context);
  } catch (error) {
    console.log(error);
    return {
      statusCode: 401,
      body: JSON.stringify("Unauthorized"),
    };
  }
};

exports.handler = auth(async (event, context) => {
  const client = new Client({
    cloud: {
      secureConnectBundle: filePath,
    },
    credentials: {
      username: process.env.ASTRA_DB_USERNAME,
      password: process.env.ASTRA_DB_PASSWORD,
    },
  });

  const pathSegments = event.path.split('/');
  const question_id = pathSegments[pathSegments.length - 1];

  try {
    await client.connect();

    const batchQueries = [
      {
        query: `DELETE FROM ${keyspace}.${questionsTable} WHERE question_id = ?`,
        params: [question_id],
      },
      {
        query: `DELETE FROM ${keyspace}.${answersTable} WHERE question_id = ?`,
        params: [question_id],
      }
    ];

    await client.batch(batchQueries, { prepare: true });

    console.log(`Question and its associated answers with question_id: ${question_id} have been successfully deleted...`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Question and associated answers successfully deleted..." }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Question and answer deletion failed" }),
    };
  } finally {
    await client.shutdown();
  }
});
