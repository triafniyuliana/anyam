import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import authRouter from "./routes/auth_route";
import adminRouter from "./routes/admin_route";
import penggunaRouter from "./routes/pengguna_route";
import paymentRouter from "./routes/payment_route";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// STATIC FILE
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/pengguna", penggunaRouter);
app.use("/api/payment", paymentRouter);

export default app;
