// تزریق pg-mem (پُستگرسِ خالصِ JS) به‌جای ماژول pg، فقط برای تست مسیر Postgres
const { newDb } = require("pg-mem");
const db = global.__PGMEM__ || (global.__PGMEM__ = newDb());
const pg = db.adapters.createPg();
const pgPath = require.resolve("pg");
require.cache[pgPath] = { id: pgPath, filename: pgPath, loaded: true, exports: pg };
