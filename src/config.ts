import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const API_PORT = process.env.API_PORT || '5000';
const API_URL = process.env.API_URL || 'http://localhost:5000';

const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_DATABASE = process.env.DB_DATABASE || 'saldo_api';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_PORT = Number(process.env.DB_PORT) || 5432;

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // TODO: Change this to a strong, random key
const JWT_ISSUER = process.env.JWT_ISSUER || 'saldo-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'saldo-app';

const X_CLIENT_ID = process.env.X_CLIENT_ID || '';
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET || '';

export {
  DB_USER,
  DB_HOST,
  DB_DATABASE,
  DB_PASSWORD,
  DB_PORT,
  JWT_SECRET,
  JWT_ISSUER,
  JWT_AUDIENCE,
  NODE_ENV,
  API_PORT,
  API_URL,
  X_CLIENT_ID,
  X_CLIENT_SECRET,
};
