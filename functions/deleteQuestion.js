import jwt from "jsonwebtoken";
import { Client } from "cassandra-driver";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  cloud: {
    secureConnectBundle: "secure-connect-stack-overflow.zip",
  },
  credentials: {
    username: process.env.ASTRA_DB_USERNAME,
    password: process.env.ASTRA_DB_PASSWORD,
  },
});

const keyspace = process.env.ASTRA_DB_KEYSPACE;
const tablename1 = process.env.ASTRA_DB_QUESTIONS;
const tablename2 = process.env.ASTRA_DB_ANSWERS;

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
    event.userId = decodeData?.id;
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
      DELETE FROM ${keyspace}.${tablename1}
      WHERE question_id = ?`;

    const deleteQuestionParams = [question_id];

    await client.execute(deleteQuestionQuery, deleteQuestionParams, { prepare: true });

    const deleteAnswersQuery = `
      DELETE FROM ${keyspace}.${tablename2}
      WHERE question_id = ?`;
    
    const deleteAnswersParams = [question_id];

    await client.execute(deleteAnswersQuery, deleteAnswersParams, { prepare: true });

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
