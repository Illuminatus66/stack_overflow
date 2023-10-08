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

// Establish database connection
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
      SET noOfAnswers = ?
      WHERE questionid = ?`;

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
    const { noOfAnswers, answerBody, userAnswered } = JSON.parse(event.body);
    const userId = event.userId;

    await updateNoOfQuestions(_id, noOfAnswers);

    const insertQuery = `
      INSERT INTO ${keyspace}.${tablename2} (question_id, answer_body, user_answered, user_id, answered_on)
      VALUES (?, ?, ?, ?, toTimestamp(now()))`;

    const insertParams = [_id, answerBody, userAnswered, userId];

    await client.execute(insertQuery, insertParams, { prepare: true });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Answer posted successfully" }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong..." }),
    };
  }
});
