
import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: Number(DB_PORT),
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    entities: ["src/models/*.ts"],
    synchronize: true
});
