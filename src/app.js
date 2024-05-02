import express from "express";
import { config } from "dotenv";
import path from "path";
import morgan from "morgan";
import cors from "cors";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";
const __dirname = path.resolve();
config();
const app = express();
//middlewares

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// remove this middleware in production
app.use(morgan("dev"));
//routes
app.use("/api/v1", router);
export default app;
