const { instrumentDB, metrics } = require('../utils/metrics');
const { Pool } = require('pg');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const fs = require('fs')

const client = new SecretsManagerClient({
  region: "eu-west-2",
});

let pool;

async function initializeDatabase() {
  if (!pool) {
    let response;

    try {
      response = await client.send(
        new GetSecretValueCommand({
          SecretId: process.env.DB_SECRET_ARN,
          VersionStage: "AWSCURRENT", 
        })
      );
    } catch (error) {
      console.error("Error retrieving secret:", error);
      throw error; // Rethrow or handle as needed
    }
    const secret = response.SecretString;
    const dbCredentials = JSON.parse(secret);

    const sslCert = fs.readFileSync('/etc/ssl/certs/rds-ca.pem', 'utf8');

    pool = new Pool({
      user: dbCredentials.username,
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      password: dbCredentials.password,
      port: 5432,
      ssl: {
        rejectUnauthorized: true,
        ca: sslCert
      }
    });

    pool.on('connect', () => {
      metrics.activeConnections.inc();
    });

    pool.on('remove', () => {
      metrics.activeConnections.dec();
    });

    pool.on('error', (err) => {
      metrics.dbErrors.inc({
        type: err.code || 'unknown'
      });
    });

    // Ensure instrumentDB returns the pool
    pool = instrumentDB(pool);
  }

  return pool; // Ensure this returns the correct pool instance
}

module.exports = {
  initializeDatabase,
};