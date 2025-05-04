import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const waitlistSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(2)
    .max(30)
    .pattern(/^[a-zA-Z0-9_\s]+$/)
    .messages({
      "string.empty": "Username is required",
      "string.min": "Username must be at least 2 characters long",
      "string.max": "Username cannot exceed 30 characters",
      "string.pattern.base":
        "Username can only contain letters, numbers, underscores and spaces",
    }),
  email: Joi.string().required().email().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
});

export const validateWaitlistEntry = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = waitlistSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.context?.key,
      message: detail.message,
    }));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  next();
};
