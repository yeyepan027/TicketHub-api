import dotenv from 'dotenv';
import sql from 'mssql';

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

let pool;
try {
  pool = await sql.connect(config);
  console.log('Connected to Azure SQL Database');
} catch (err) {
  console.error('DB Connection Error:', err);
}

export { sql, pool };