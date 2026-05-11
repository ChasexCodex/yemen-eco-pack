import { Pool } from "pg";

declare global {
  var __biopakPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set");
}

export const dbPool =
  global.__biopakPool ??
  new Pool({
    connectionString,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__biopakPool = dbPool;
}

