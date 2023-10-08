const dotenv = require('dotenv');
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

async function listTablesAndFields() {
  try {
    await client.connect();

    const query = 'SELECT table_name, column_name, type FROM system_schema.columns WHERE keyspace_name = ?';
    const params = [process.env.ASTRA_DB_KEYSPACE];

    const result = await client.execute(query, params, { prepare: true });

    const tableDetails = {};
    result.rows.forEach((row) => {
      const tableName = row.table_name;
      const columnName = row.column_name;
      const columnType = row.type;

      if (!tableDetails[tableName]) {
        tableDetails[tableName] = [];
      }

      tableDetails[tableName].push({ columnName, columnType });
    });

    console.log('Tables and Fields in keyspace:');
    console.log(tableDetails);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.shutdown();
  }
}

listTablesAndFields();
