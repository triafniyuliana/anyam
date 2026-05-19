import { Router } from "express";
import {
  login,
  register,
  registerAdmin,
} from "../controller/auth_api_controller";

const router = Router();

// REGISTER
router.post("/register", register);

// REGISTER ADMIN
router.post("/register-admin", registerAdmin);

// LOGIN
router.post("/login", login);

export default router;
