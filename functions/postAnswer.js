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

const updateNoOfQuestions = async (question_id, noofanswers) => {
  try {
    const query = `
      UPDATE ${keyspace}.${questionsTable}
      SET noofanswers = ?
      WHERE question_id = ?`;

    const params = [noofanswers, question_id];

    await client.execute(query, params, { prepare: true });
  } catch (error) {
    console.log(error);
  }
};

exports.handler = auth(async (event, context) => {
  try {
    const pathSegments = event.path.split('/');
    const question_id = pathSegments[pathSegments.length - 1];
    const { noofanswers, answerbody, useranswered } = JSON.parse(event.body);
    const user_id = event.user_id;

    await updateNoOfQuestions(question_id, noofanswers);

    const insertQuery = `
      INSERT INTO ${keyspace}.${answersTable} (answer_id, question_id, answerbody, useranswered, user_id, answeredon)
      VALUES (uuid(), ?, ?, ?, ?, toTimestamp(now()))`;

    const insertParams = [question_id, answerbody, useranswered, user_id];

    await client.execute(insertQuery, insertParams, { prepare: true });

    // Query the question with its associated answers
    const queryQuestion = `SELECT * FROM ${keyspace}.${questionsTable} WHERE question_id = ?`;
    const queryAnswers = `SELECT * FROM ${keyspace}.${answersTable} WHERE question_id = ?`;

    const updatedQuestion = (await client.execute(queryQuestion, [question_id], { prepare: true })).rows[0];
    const answers = await client.execute(queryAnswers, [question_id], { prepare: true });

    // Add answers to the question object
    updatedQuestion.answers = answers.rows;

    return {
      statusCode: 200,
      body: JSON.stringify(updatedQuestion),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Something went wrong..." }),
    };
  }
});
