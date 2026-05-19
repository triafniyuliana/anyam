import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { generateToken } from "../utils/jwt";

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    // VALIDASI
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,

        message: "Semua field wajib diisi",
      });
    }

    // VALIDASI ROLE
    if (role !== "pengguna" && role !== "pengrajin") {
      return res.status(400).json({
        success: false,

        message: "Role tidak valid",
      });
    }

    // CHECK EMAIL
    const checkUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (checkUser) {
      return res.status(400).json({
        success: false,

        message: "Email sudah digunakan",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
    const user = await prisma.user.create({
      data: {
        username,

        email,

        password: hashedPassword,

        role,
      },
    });

    // RESPONSE
    return res.status(201).json({
      success: true,

      message: "Register berhasil",

      user: {
        id: user.id,

        username: user.username,

        email: user.email,

        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: "Internal server error",
    });
  }
};
// REGISTER ADMIN
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // VALIDASI
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }

    // CHECK EMAIL
    const checkUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE ADMIN
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "admin",
      },
    });

    // RESPONSE
    return res.status(201).json({
      success: true,
      message: "Register admin berhasil",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // VALIDASI
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    // CHECK USER
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    console.log(user);

    // USER TIDAK ADA
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // DEBUG PASSWORD
    console.log(password);
    console.log(user.password);

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password as string);

    console.log(isMatch);

    // PASSWORD SALAH
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // GENERATE TOKEN
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // RESPONSE
    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
