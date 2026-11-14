import "reflect-metadata";
import dotenv from "dotenv";
import app from "./app";
import { AppDataSource } from "./config/dataSource";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {

    try {

        await AppDataSource.initialize();

        console.log("Banco de dados conectado!");

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });

    } catch (erro) {

        console.error("Erro ao iniciar servidor:", erro);

        process.exit(1);
    }
}

startServer();