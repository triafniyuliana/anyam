import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

// AUTH MIDDLEWARE
export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  try {
    // AMBIL HEADER
    const authHeader = req.headers.authorization;

    // TOKEN TIDAK ADA
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ada",
      });
    }

    // AMBIL TOKEN
    const token = authHeader.split(" ")[1];

    // VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    // SIMPAN USER KE REQUEST
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

// ROLE MIDDLEWARE
export const roleMiddleware = (role: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    // ROLE TIDAK SESUAI
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    next();
  };
};
