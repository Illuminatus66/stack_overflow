import { Client } from 'cassandra-driver';
import dotenv from 'dotenv';

dotenv.config();

exports.handler = async function (event, context) {
  const keyspace = process.env.ASTRA_DB_KEYSPACE;
  const tableName = process.env.ASTRA_DB_USERS;

  const client = new Client({
    cloud: { secureConnectBundle: "secure-connect-stack-overflow.zip" },
    credentials: { 
      username: process.env.ASTRA_DB_USERNAME, 
      password: process.env.ASTRA_DB_PASSWORD },
  });

  try {
    await client.connect();

    const query = `SELECT * FROM ${keyspace}.${tableName}`;

    const result = await client.execute(query, [], { prepare: true });

    const allUserDetails = result.rows.map((row) => ({
      user_id: row.user_id,
      name: row.name,
      about: row.about,
      tags: row.tags,
      joinedOn: row.joinedon,
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
