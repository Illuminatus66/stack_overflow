const dotenv = require("dotenv");
const { Client } = require('cassandra-driver');

dotenv.config();

const client = new Client({
  cloud: {
    secureConnectBundle: 'secure-connect-stack-overflow.zip',
  },
  credentials: {
    username: process.env.ASTRA_DB_USERNAME,
    password: process.env.ASTRA_DB_PASSWORD,
  },
});

const keyspace = process.env.ASTRA_DB_KEYSPACE;

const dropAllTables = async () => {
  try {
    await client.connect();

    const query = 'SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?';
    const params = [keyspace];
    const result = await client.execute(query, params, { prepare: true });

    // Drop all tables
    for (const row of result.rows) {
      const tableName = row.table_name;
      const dropQuery = `DROP TABLE IF EXISTS ${keyspace}.${tableName}`;
      await client.execute(dropQuery);
      console.log(`Dropped table: ${keyspace}.${tableName}`);
    }

    console.log('All tables dropped successfully.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.shutdown();
  }
};

dropAllTables();
