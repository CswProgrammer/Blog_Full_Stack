import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

for (const candidate of ['.env', '../../.env', '../../../.env']) {
  const envPath = path.resolve(process.cwd(), candidate);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.API_PORT ?? 4000),
  mysql: {
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: Number(process.env.MYSQL_PORT ?? 3306),
    database: process.env.MYSQL_DATABASE ?? 'blog',
    user: process.env.MYSQL_USER ?? 'blog',
    password: process.env.MYSQL_PASSWORD ?? 'blog_password'
  },
  redis: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379)
  },
  jwtSecret: process.env.JWT_SECRET ?? 'dev_secret_change_me',
  adminUsername: process.env.ADMIN_USERNAME ?? 'admin',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123456',
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads'
};
