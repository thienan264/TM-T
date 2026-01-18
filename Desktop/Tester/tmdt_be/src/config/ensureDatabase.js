import { Client } from "pg";

export async function ensureDatabaseExists() {
    const user = process.env.PGUSER || "postgres";
    const password = process.env.PGPASSWORD || "postgres";
    const host = process.env.PGHOST || "localhost";
    const port = Number(process.env.PGPORT || 5432);
    const database = process.env.PGDATABASE;
    if (!database) return;
    const client = new Client({ user, password, host, port, database: "postgres", ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined });
    try {
        await client.connect();
        const { rows } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [database]);
        if (!rows.length) {
            await client.query(`CREATE DATABASE "${database}"`);
        }
    } catch (_) {
    } finally {
        try { await client.end(); } catch (_) {}
    }
}
