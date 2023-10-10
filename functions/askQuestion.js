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

const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected to Cassandra");
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
  try {
    const questionData = JSON.parse(event.body);
    const user_id = event.user_id;

    const query = `
      INSERT INTO ${keyspace}.${questionsTable} (question_id, questiontitle, questionbody, questiontags, userposted, user_id, noofanswers, vote_count, askedon)
      VALUES (uuid(), ?, ?, ?, ?, ?, ?, ?, toTimestamp(now()))`;

    const vote_count = 0;
    const noofanswers = 0;
    const params = [
      questionData.questiontitle,
      questionData.questionbody,
      questionData.questiontags,
      questionData.userposted,
      user_id,
      noofanswers,
      vote_count,
    ];

    await client.execute(query, params, { prepare: true });

    return {
      statusCode: 200,
      body: JSON.stringify("Posted a question successfully"),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 409,
      body: JSON.stringify("Couldn't post a new question"),
    };
  }
});
