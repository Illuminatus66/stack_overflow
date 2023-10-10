const dotenv = require("dotenv");
const { Client } = require("cassandra-driver");

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
const tablename = process.env.ASTRA_DB_VOTES;

const createUserTable = async () => {
  try {
    console.log('Connecting to AstraDB...');
    await client.connect();
    console.log('Connected to AstraDB.');

    const query = `
      CREATE TABLE IF NOT EXISTS ${keyspace}.${tablename} (
        user_id UUID PRIMARY KEY,
        question_id UUID,
        vote_value INT,
      );
    `;

    await client.execute(query);

    console.log('Table creation completed.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.shutdown();
    console.log('AstraDB connection closed.');
  }
};

const main = async () => {
  await createUserTable();
};

main();
