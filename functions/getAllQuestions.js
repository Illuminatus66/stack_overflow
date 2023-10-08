import { Client } from 'cassandra-driver';
import dotenv from 'dotenv';

dotenv.config();

exports.handler = async function (event, context) {
  const keyspace = process.env.ASTRA_DB_KEYSPACE;
  const tableName1 = process.env.ASTRA_DB_QUESTIONS;
  const tableName2 = process.env.ASTRA_DB_ANSWERS;
  const client = new Client({
    cloud: {
      secureConnectBundle: "secure-connect-stack-overflow.zip"
    },
    credentials: {
      username: process.env.ASTRA_DB_USERNAME,
      password: process.env.ASTRA_DB_PASSWORD,
    },
  });

  try {
    await client.connect();

    const queryQuestions = `SELECT * FROM ${keyspace}.${tableName1}`;
    const queryAnswers = `SELECT * FROM ${keyspace}.${tableName2}`;

    const questions = await client.execute(queryQuestions, [], { prepare: true });
    const answers = await client.execute(queryAnswers, [], { prepare: true });

    // Create a map to store questions with their associated answers.
    const questionMap = new Map();

    questions.rows.forEach((question) => {
      questionMap.set(question.question_id, {
        ...question,
        answers: [],
      });
    });

    // Populate the 'answers' array within the amswers.
    answers.rows.forEach((answer) => {
      const questionId = answer.question_id;

      if (questionMap.has(questionId)) {
        questionMap.get(questionId).answers.push(answer);
      }
    });

    // Convert the map to an array of questions with answers.
    const questionsWithAnswers = Array.from(questionMap.values());

    return {
      statusCode: 200,
      body: JSON.stringify(questionsWithAnswers),
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
