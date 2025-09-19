import type { Request, Response } from "express";
import { matchedData } from "express-validator";
import { BadRequestError, NotFoundError } from "../common/errors.ts";
import type {
  LoginCredentials,
  RegisterRequestBody,
} from "../common/types.ts";
import { User } from "../models/user.ts";
import process from "node:process";
import jwt from "jsonwebtoken";
import { transporter } from "../settings.ts";
import express from "express";
import { body, param } from "express-validator";


export async function login(request: Request, response: Response) {
  const { email, password }: LoginCredentials = matchedData(request);

  const user = await User.findOne({ where: { email: email } });

  if (!user || user.password !== password) {
    throw new NotFoundError("User not found.");
  }

  request.session!["userId"] = user.id;
  response.json({ data: { user } });
}

export async function register(request: Request, response: Response) {
  const {
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
  }: RegisterRequestBody = matchedData(request);

  if (password !== confirmPassword) {
    throw new BadRequestError("Password and Confirm-Password must match.");
  }

  const user = await User.findOne({ where: { email } });

  if (user) {
    throw new BadRequestError("Email already exists.");
  }

  const token = jwt.sign(
    { email, password, firstName, lastName },
    process.env["SECRET_KEY"]!,
    { expiresIn: "1h" }
  );
  const verificationLink = `http://localhost:3000/auth/verify/${token}`;

  transporter.sendMail({
    to: email,
    subject: "Verify your email",
    html: `<p>Click here to verify: <a href="${verificationLink}">${verificationLink}</a></p>`,
  });

  response.json({ success: true });
}

export function verify(request: Request, response: Response) {
  const { token }: { token: string } = matchedData(request);
  const payload = jwt.verify(token, process.env["SECRET_KEY"]!) as Pick<
    User,
    "email" | "password" | "firstName" | "lastName"
  >;
  User.create(payload);
  response.json({ success: true });
}

export const authRouter = express.Router();

authRouter.post(
  "/login",
  body("email").notEmpty().trim().isEmail(),
  body("password").notEmpty().trim().isLength({ min: 2, max: 16 }),
  login
);

authRouter.post(
  "/register",
  body("email").notEmpty().trim().isEmail(),
  body("password").notEmpty().trim().isLength({ min: 4, max: 16 }),
  body("confirmPassword").notEmpty().trim().isLength({ min: 4, max: 16 }),
  body("firstName").notEmpty().trim().isLength({ min: 2, max: 32 }),
  body("lastName").notEmpty().trim().isLength({ min: 2, max: 32 }),
  register
);

authRouter.get("/verify/:token", param("token").notEmpty().isJWT(), verify);
