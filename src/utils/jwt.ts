import jwt from "jsonwebtoken";

export const generateToken = (user: {
  id: string;
  email: string;
  role: string;
}) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    },
  );
};
