import express from "express";
import path from "path";
import routes from "./routes/routes";

const app = express();

app.use(express.json());

app.use("/api", routes);

// Frontend HTML/CSS/JS servido pelo próprio backend.
app.use(express.static(path.join(process.cwd(), "public")));

export default app;