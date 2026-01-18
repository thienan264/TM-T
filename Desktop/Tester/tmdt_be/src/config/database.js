import { Sequelize } from "sequelize";
import "dotenv/config";

// Cho phép cấu hình qua DATABASE_URL hoặc các biến PG*
function buildConnectionString() {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
        return process.env.DATABASE_URL;
    }

    const user = process.env.PGUSER;
    const password = process.env.PGPASSWORD;
    const host = process.env.PGHOST || "localhost";
    const port = process.env.PGPORT || "5432";
    const database = process.env.PGDATABASE;

    if (user && password && database) {
        return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    }

    return undefined;
}

const connectionString = buildConnectionString();

let sequelizeInstance;
if (connectionString) {
    sequelizeInstance = new Sequelize(connectionString, {
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            // Nếu deploy Render/Heroku có SSL thì bật
            ssl: process.env.PGSSL === "true" ? { require: true, rejectUnauthorized: false } : false,
        },
    });
} else {
    const user = process.env.PGUSER || "postgres";
    const password = process.env.PGPASSWORD || "postgres";
    const host = process.env.PGHOST || "localhost";
    const port = process.env.PGPORT || "5432";
    const database = process.env.PGDATABASE || "postgres";

    sequelizeInstance = new Sequelize(database, user, password, {
        host,
        port,
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: process.env.PGSSL === "true" ? { require: true, rejectUnauthorized: false } : false,
        },
    });
}

export const sequelize = sequelizeInstance;

export async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log("PostgreSQL connected via connection string");

        // Ensure new columns exist on orders table to avoid runtime errors
        const ensures = [
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS \"paymentMethod\" varchar(255)",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS \"paymentStatus\" varchar(255) DEFAULT 'pending'",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS \"deliveryMethod\" varchar(255)",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS \"notes\" text",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS \"couponId\" integer",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS \"couponCode\" varchar(255)",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS \"discountAmount\" numeric(10,2) DEFAULT 0",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS \"subtotal\" numeric(10,2)",
            "ALTER TABLE reviews ALTER COLUMN \"rating\" DROP NOT NULL"
        ];
        // Create banners table if not exists (fallback when sync fails)
        const createBanners = `
        CREATE TABLE IF NOT EXISTS banners (
          id SERIAL PRIMARY KEY,
          title varchar(255),
          image varchar(512) NOT NULL,
          link varchar(512),
          position varchar(64) DEFAULT 'home' NOT NULL,
          "order" integer DEFAULT 0 NOT NULL,
          "isActive" boolean DEFAULT true NOT NULL,
          "createdAt" timestamp with time zone DEFAULT NOW(),
          "updatedAt" timestamp with time zone DEFAULT NOW()
        );`;
        try { await sequelize.query(createBanners); } catch (_) { }
        for (const sql of ensures) {
            try { await sequelize.query(sql); } catch (_) { /* ignore */ }
        }

        await sequelize.sync({ alter: true });

        console.log("Synced models with database");
    } catch (err) {
        console.error("DB connect failed:", err.message || err);
        throw err;
    }
}
