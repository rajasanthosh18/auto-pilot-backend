import { NextFunction, Request, Response } from "express";
import Joi from "joi";

type ValidateType = "body" | "query" | "params";

export function validateSchema<T extends ValidateType = "body">(
  schema: Joi.ObjectSchema,
  type: T = "body" as T
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[type], { abortEarly: false });
    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        data: error.details.map((d) => d.message),
      });
      return;
    }
    next();
  };
}
