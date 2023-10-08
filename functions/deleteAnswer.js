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

const updateNoOfQuestions = async (_id, noOfAnswers) => {
  try {
    const query = `
      UPDATE ${keyspace}.${tablename1}
      SET no_of_answers  = ?
      WHERE question_id = ?`;

    const params = [noOfAnswers, _id];

    await client.execute(query, params, { prepare: true });
  } catch (error) {
    console.log(error);
  }
};

exports.handler = auth(async (event, context) => {
  try {
    const pathSegments = event.path.split('/');
    const _id = pathSegments[pathSegments.length - 1];
    const { answerId, noOfAnswers } = JSON.parse(event.body);

    await updateNoOfQuestions(_id, noOfAnswers);

    const deleteQuery = `
      DELETE FROM ${keyspace}.${tablename2}
      WHERE question_id = ?
      AND answer_id = ?`;

    const deleteParams = [_id, answerId];

    await client.execute(deleteQuery, deleteParams, { prepare: true });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Successfully deleted..." }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong..." }),
    };
  }
});
