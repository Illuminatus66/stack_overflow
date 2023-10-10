import { Client } from 'cassandra-driver';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const filePath = path.join(__dirname, '../secure-connect-stack-overflow.zip')

exports.handler = async function (event, context) {
  const keyspace = process.env.ASTRA_DB_KEYSPACE;
  const questionsTable = process.env.ASTRA_DB_QUESTIONS;
  const answersTable = process.env.ASTRA_DB_ANSWERS;
  const client = new Client({
    cloud: {
      secureConnectBundle: filePath
    },
    credentials: {
      username: process.env.ASTRA_DB_USERNAME,
      password: process.env.ASTRA_DB_PASSWORD,
    },
  });

  try {
    await client.connect();

    const queryQuestions = `SELECT * FROM ${keyspace}.${questionsTable}`;
    const queryAnswers = `SELECT * FROM ${keyspace}.${answersTable}`;

    const questions = await client.execute(queryQuestions, [], { prepare: true });
    const answer = await client.execute(queryAnswers, [], { prepare: true });

    // Create a map to store questions with their associated answers.
    const questionMap = new Map();

    questions.rows.forEach((question) => {
      questionMap.set(question.question_id, {
        ...question,
        answer: [],
      });
    });

    // Populate the 'answers' array within the amswers.
    answer.rows.forEach((answer) => {
      const question_id = answer.question_id;

      if (questionMap.has(question_id)) {
        questionMap.get(question_id).answer.push(answer);
      }
    });

    // Convert the map to an array of questions with answers.
    const questionList = Array.from(questionMap.values());

    return {
      statusCode: 200,
      body: JSON.stringify(questionList),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Something went wrong...' }),
    };
  } finally {
    await client.shutdown();
  }
};
