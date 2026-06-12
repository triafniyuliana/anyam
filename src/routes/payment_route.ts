import express from "express";

import { createTransaction, handleWebhook , checkStatus} from "../controller/payment_controller";

const router = express.Router();

// CREATE TRANSACTION
router.post("/create", createTransaction);

router.post("/webhook", handleWebhook);

router.get("/status/:orderId", checkStatus);

export default router;
