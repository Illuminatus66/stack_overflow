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
const tablename = process.env.ASTRA_DB_USERS;

const createUserTable = async () => {
  try {
    console.log('Connecting to AstraDB...');
    await client.connect();
    console.log('Connected to AstraDB.');

    const query = `
      CREATE TABLE IF NOT EXISTS ${keyspace}.${tablename} (
        user_id UUID,
        name TEXT,
        email TEXT,
        password TEXT,
        about TEXT,
        tags SET<TEXT>,
        joinedon TIMESTAMP,
        PRIMARY KEY (user_id, email)
      );
    `;

    await client.execute(query);

    console.log('Table creation completed.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Ensure that the client is closed, whether an error occurred or not.
    await client.shutdown();
    console.log('AstraDB connection closed.');
  }
};

const main = async () => {
  await createUserTable();
};

main();
