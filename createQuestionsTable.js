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
const tablename = process.env.ASTRA_DB_QUESTIONS;

const createNewQuestionsTable = async () => {
  try {
    console.log('Connecting to AstraDB...');
    await client.connect();
    console.log('Connected to AstraDB.');

    // Drop the old 'questions' table if it exists
    const dropQuery = `
      DROP TABLE IF EXISTS ${keyspace}.${tablename};
    `;

    await client.execute(dropQuery);

    const createQuery = `
      CREATE TABLE IF NOT EXISTS ${keyspace}.${tablename} (
        question_id UUID PRIMARY KEY,
        questiontitle TEXT,
        questionbody TEXT,
        questiontags SET<TEXT>,
        noofanswers INT,
        vote_count INT,
        userposted TEXT,
        user_id UUID,
        askedon TIMESTAMP,
      );
    `;

    await client.execute(createQuery);

    console.log('New table creation completed.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.shutdown();
    console.log('AstraDB connection closed.');
  }
};

const main = async () => {
  await createNewQuestionsTable();
};

main();
