
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
  },
  migrations: {
    directory: path.join(__dirname, '..', 'migrations'),
    loadExtensions: ['.js'],
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
    loadExtensions: ['.js'],
  },
};

export default {
  development: config,
  production: config,
};

