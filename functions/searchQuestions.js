import dotenv from "dotenv";
import { Client } from 'cassandra-driver';
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

client.connect().catch(error => {
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});


exports.handler = async function (event, context) {
  const { query } = event.queryStringParameters;
  const keyspace = process.env.ASTRA_DB_KEYSPACE;
  const questionsTable = process.env.ASTRA_DB_QUESTIONS;

  try {
    const searchquery = `
      SELECT * FROM ${keyspace}.${questionsTable}
      WHERE solr_query='${query}' LIMIT 30;
      ALLOW FILTERING`;

    const searchResults = await client.execute(searchquery);

    return {
      statusCode: 200,
      body: JSON.stringify(searchResults.rows),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Search failed" }),
    };
  }
};
