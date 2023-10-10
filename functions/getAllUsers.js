import { Client } from 'cassandra-driver';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const filePath = path.join(__dirname, '../secure-connect-stack-overflow.zip')

exports.handler = async function (event, context) {
  const keyspace = process.env.ASTRA_DB_KEYSPACE;
  const usersTable = process.env.ASTRA_DB_USERS;

  const client = new Client({
    cloud: { 
      secureConnectBundle: filePath 
    },
    credentials: { 
      username: process.env.ASTRA_DB_USERNAME, 
      password: process.env.ASTRA_DB_PASSWORD },
  });

  try {
    await client.connect();

    const query = `SELECT * FROM ${keyspace}.${usersTable}`;

    const result = await client.execute(query, [], { prepare: true });

    const allUserDetails = result.rows.map((row) => ({
      user_id: row.user_id,
      name: row.name,
      about: row.about,
      tags: row.tags,
      joinedon: row.joinedon,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(allUserDetails),
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
