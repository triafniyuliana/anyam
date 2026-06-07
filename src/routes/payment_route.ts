import express from "express";
import { createTransaction } from "../controller/payment_controller";

const router = express.Router();

// CREATE TRANSACTION
router.post("/create", createTransaction);

export default router;