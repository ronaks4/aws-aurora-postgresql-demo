import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { attachDatabasePool } from "@vercel/functions";
import { Signer } from "@aws-sdk/rds-signer";
import { ClientBase, Pool } from "pg";
import { cacheable } from "./cacheable";

const signer = new Signer({
  hostname: process.env.PGHOST!,
  port: Number(process.env.PGPORT),
  username: process.env.PGUSER!,
  region: process.env.AWS_REGION!,
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN!,
    clientConfig: { region: process.env.AWS_REGION! },
  }),
});

const pool = new Pool({
  host: process.env.PGHOST!,
  user: process.env.PGUSER!,
  database: process.env.PGDATABASE || "postgres",
  password: cacheable(
    () => signer.getAuthToken(),
    // Token is valid for 15 minutes, set expiry to 14 minutes to be safe
    14 * 60 * 1000,
  ),
  port: Number(process.env.PGPORT),
  ssl: { rejectUnauthorized: false },
  max: 20,
});
attachDatabasePool(pool);

// Single query transaction.
export async function query(sql: string, args: unknown[]) {
  return pool.query(sql, args);
}

export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
