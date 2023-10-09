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

const truncateAllTables = async () => {
  try {
    await client.connect();

    const query = 'SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?';
    const params = [keyspace];
    const result = await client.execute(query, params, { prepare: true });

    for (const row of result.rows) {
      const tableName = row.table_name;
      const truncateQuery = `TRUNCATE TABLE IF EXISTS ${keyspace}.${tableName}`;
      await client.execute(truncateQuery);
      console.log(`Truncated table: ${keyspace}.${tableName}`);
    }

    console.log('All tables truncated successfully.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.shutdown();
  }
};

truncateAllTables();
