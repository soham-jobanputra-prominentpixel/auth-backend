import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ValidationError } from "../common/errors.ts";

export default function validationMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    throw new ValidationError(
      "Validation failed: " + Object.values(errors.mapped()).join(" "),
    );
  }
  next();
}
