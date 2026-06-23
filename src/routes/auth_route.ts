import { Router } from "express";

import {
  login,
  register,
  registerAdmin,
  verifyOtp,
  requestResetPassword,
  resetPassword,
  loginAdmin,
  resendOtp,
  googleLogin,
} from "../controller/auth_controller";

const router = Router();

//GOOGLE LOGIN
router.post("/google",googleLogin);

// REGISTER
router.post("/register", register);

// REGISTER ADMIN
router.post("/register-admin", registerAdmin);

// LOGIN ADMIN
router.post("/login-admin", loginAdmin);

// LOGIN
router.post("/login", login);

// VERIFY OTP
router.post("/verify-otp", verifyOtp);

// RESEND OTP
router.post("/resend-otp", resendOtp);

// REQUEST RESET PASSWORD
router.post("/request-reset-password", requestResetPassword);

// RESET PASSWORD
router.post("/reset-password", resetPassword);

export default router;
