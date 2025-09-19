import { type Request, type Response } from "express";
import { User } from "../models/user.ts";
import { NotFoundError, ValidationError } from "../common/errors.ts";
import { matchedData } from "express-validator";
import { UniqueConstraintError } from "sequelize";
import type {
  UserPatchBody,
  UserRequestBody,
  UserRequestQuery,
} from "../common/types.ts";
import { sequelize } from "../settings.ts";
import { Router } from "express";
import { body, param } from "express-validator";
import validationMiddleware from "../middleware/validationMiddleware.ts";

export async function getAllUsers(_request: Request, response: Response) {
  const users = await User.findAll();
  response.json({ data: { users } });
}

export async function getUserById(request: Request, response: Response) {
  const { userId }: UserRequestQuery = matchedData(request);
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  response.json({ data: { user } });
}

export async function deleteUser(request: Request, response: Response) {
  const { userId }: UserRequestQuery = matchedData(request);
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  user.destroy();
  response.json({ success: true });
}

export async function createUser(request: Request, response: Response) {
  const { email, password, firstName, lastName }: UserRequestBody = matchedData(
    request,
  );
  try {
    const user = await User.create({ email, password, firstName, lastName });
    response.json({ data: { user } });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ValidationError("Email already exists.");
    }
    throw error;
  }
}

export async function patchUser(request: Request, response: Response) {
  const { userId }: UserPatchBody = matchedData(request);
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  const { email, password, firstName, lastName }: UserPatchBody = matchedData(
    request,
  );
  try {
    await sequelize.transaction(async (transaction) => {
      user.email = email ?? user.email;
      user.password = password ?? user.password;
      user.firstName = firstName ?? user.firstName;
      user.lastName = lastName ?? user.lastName;
      await user.save({ transaction });
    });
    await user.reload();
    response.json({ data: { user } });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ValidationError("Email already exists.");
    }
    throw error;
  }
}

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

