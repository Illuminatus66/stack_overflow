import dotenv from "dotenv";
import { Client } from 'cassandra-driver';

dotenv.config();

exports.handler = async function (event, context) {
  const { query } = event.queryStringParameters;
  const keyspace = process.env.ASTRA_DB_KEYSPACE;
  const tablename = process.env.ASTRA_DB_QUESTIONS;

  const client = new Client({
    cloud: { 
      secureConnectBundle: "secure-connect-stack-overflow.zip",
    },
    credentials: { 
      username: process.env.ASTRA_DB_USERNAME,
      password: process.env.ASTRA_DB_PASSWORD,
    },
  });

  try {
    await client.connect();
    const searchquery = `
      SELECT * FROM ${keyspace}.${tablename}
      WHERE solr_query='${query}' LIMIT 30;`;

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
  } finally {
    await client.shutdown();
  }
};
