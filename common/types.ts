import type { Request } from "express";
import type { User } from "../src/models/user.ts";

export interface UserRequestQuery {
  userId: number;
}

export interface UserRequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export type UserPatchBody = Partial<UserRequestBody> & UserRequestQuery;

export type LoginCredentials = Pick<UserRequestBody, "email" | "password">;

export type UserSession = UserRequestQuery;

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface RegisterRequestBody extends UserRequestBody {
  confirmPassword: string;
}
