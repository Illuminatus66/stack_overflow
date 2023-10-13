import jwt from "jsonwebtoken";
import { Client } from "cassandra-driver";
import dotenv from "dotenv";
import path from 'path';

dotenv.config();

const filePath = path.join(__dirname, '../secure-connect-stack-overflow.zip')

const client = new Client({
  cloud: {
    secureConnectBundle: filePath,
  },
  credentials: {
    username: process.env.ASTRA_DB_USERNAME,
    password: process.env.ASTRA_DB_PASSWORD,
  },
});

const keyspace = process.env.ASTRA_DB_KEYSPACE;
const questionsTable = process.env.ASTRA_DB_QUESTIONS;
const answersTable = process.env.ASTRA_DB_ANSWERS;

const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to Astra DB");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

connectDB();

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
  const pathSegments = event.path.split('/');
  const question_id = pathSegments[pathSegments.length - 1];

  try {
    const deleteQuestionQuery = `
      DELETE FROM ${keyspace}.${questionsTable}
      WHERE question_id = ?`;

    const deleteQuestionParams = [question_id];

    await client.execute(deleteQuestionQuery, deleteQuestionParams, { prepare: true });

    const deleteAnswersQuery = `
      DELETE FROM ${keyspace}.${answersTable}
      WHERE question_id = ?`;
    
    const deleteAnswersParams = [question_id];

    await client.execute(deleteAnswersQuery, deleteAnswersParams, { prepare: true });

    console.log(`Question and it's associated answers with question_id : ${question_id} have been successfully deleted...`)

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Question and associated answer successfully deleted..." }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Question and answer deletion failed" }),
    };
  }
});
