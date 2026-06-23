import { Request, Response } from "express";

import {
  registerService,
  registerAdminService,
  loginService,
  verifyOtpService,
  resendOtpService,
  requestResetPasswordService,
  resetPasswordService,
  loginAdminService,
  googleLoginService,
} from "../services/auth_service";

//LOGIN GOOGLE
export const googleLogin = async (
  req: any,
  res: any
) => {
  try {
    const { idToken } = req.body;

    const result = await googleLoginService(
      idToken
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const result = await registerService(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error(error.message);

    return res.status(400).json({
      success: false,
      message: error.message ? error.message : "Gagal register",
    });
  }
};

// REGISTER ADMIN
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const result = await registerAdminService(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error(error.message);

    return res.status(400).json({
      success: false,
      message: error.message ? error.message : "Gagal register admin",
    });
  }
};

// LOGIN ADMIN
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const result = await loginAdminService(req.body);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error.message);

    return res.status(401).json({
      success: false,
      message: error.message ? error.message : "Login admin gagal",
    });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginService(req.body);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error.message);

    return res.status(401).json({
      success: false,
      message: error.message ? error.message : "Login gagal",
    });
  }
};

// VERIFY OTP
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const result = await verifyOtpService(req.body);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error.message);

    return res.status(401).json({
      success: false,
      message: error.message ? error.message : "OTP tidak valid",
    });
  }
};

// RESEND OTP
export const resendOtp = async (
  req: Request,
  res: Response,
) => {

  try {

    const result =
        await resendOtpService(
      req.body,
    );

    return res.status(200).json(result);

  } catch (error: any) {

    console.error(error.message);

    return res.status(400).json({
      success: false,
      message: error.message
        ? error.message
        : "Gagal mengirim ulang OTP",
    });
  }
};

// REQUEST RESET PASSWORD
export const requestResetPassword = async (req: Request, res: Response) => {
  try {
    const result = await requestResetPasswordService(req.body);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error.message);

    return res.status(400).json({
      success: false,
      message: error.message
        ? error.message
        : "Gagal mengirim OTP reset password",
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const result = await resetPasswordService(req.body);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error.message);

    return res.status(400).json({
      success: false,
      message: error.message ? error.message : "Gagal reset password",
    });
  }
};


