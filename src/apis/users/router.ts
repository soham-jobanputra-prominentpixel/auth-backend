import { Router } from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  patchUser,
} from "./views.ts";
import { body, param } from "express-validator";
import validationMiddleware from "../../../middleware/validationMiddleware.ts";

export const usersRouter = Router();

usersRouter.get("/", getAllUsers);

usersRouter.get(
  "/single/:userId",
  param("userId").notEmpty().isInt(),
  validationMiddleware,
  getUserById,
);

usersRouter.delete(
  "/delete/:userId",
  param("userId").notEmpty().isInt(),
  validationMiddleware,
  deleteUser,
);

usersRouter.post(
  "/create",
  body("email").notEmpty().trim().isEmail(),
  body("password").notEmpty().trim().isLength({ min: 4, max: 16 }),
  body("firstName").notEmpty().trim().isLength({ min: 2, max: 32 }),
  body("lastName").notEmpty().trim().isLength({ min: 2, max: 32 }),
  validationMiddleware,
  createUser,
);

usersRouter.patch(
  "/patch/:userId",
  param("userId").notEmpty().isInt(),
  body("email").optional().trim().isEmail(),
  body("password").optional().trim().isLength({ min: 4, max: 16 }),
  body("firstName").optional().trim().isLength({ min: 2, max: 32 }),
  body("lastName").optional().trim().isLength({ min: 2, max: 32 }),
  validationMiddleware,
  patchUser,
);
