import path from 'path';
import { fileURLToPath } from 'url';

// In ES Modules, we must recreate __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  development: {
    client: 'mysql2',
    connection: {
      // Node 24 will have these ready via the --env-file flag
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
    },
    migrations: {
      directory: path.join(__dirname, '..', 'migrations'),
      // Ensures Knex handles the .js files as ES Modules
      loadExtensions: ['.js'],
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      loadExtensions: ['.js'],
    },
  }
};