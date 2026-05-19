import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRouter from "./routes/auth_api_route";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRouter);

export default app;
