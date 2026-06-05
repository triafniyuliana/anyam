import express from "express";

import dotenv from "dotenv";

import cors from "cors";

import path from "path";

import authRouter from "./routes/auth_route";

import adminRouter from "./routes/admin_route";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());

app.use(express.json());

// STATIC FILE
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads"),
  ),
);

// ROUTES
app.use("/api/auth", authRouter);

app.use("/api/admin", adminRouter);

export default app;