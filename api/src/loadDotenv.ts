import path from 'node:path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });
