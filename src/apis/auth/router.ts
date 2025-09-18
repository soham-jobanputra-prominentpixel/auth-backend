import express from "express";
import { login, register, verify } from "./views.ts";
import { body, param } from "express-validator";

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
