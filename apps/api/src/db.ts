import mysql from 'mysql2/promise';
import { config } from './config.js';

export const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  database: config.mysql.database,
  user: config.mysql.user,
  password: config.mysql.password,
  waitForConnections: true,
  connectionLimit: 8,
  namedPlaceholders: true,
  charset: 'utf8mb4',
  timezone: '+08:00'
});

export async function query<T>(sql: string, params?: Record<string, unknown> | unknown[]) {
  const [rows] = await pool.query(sql, params as never);
  return rows as T[];
}

export async function execute(sql: string, params?: Record<string, unknown> | unknown[]) {
  const [result] = await pool.execute(sql, params as never);
  return result as mysql.ResultSetHeader;
}
