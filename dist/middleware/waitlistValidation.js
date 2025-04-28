"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWaitlistEntry = void 0;
const joi_1 = __importDefault(require("joi"));
const waitlistSchema = joi_1.default.object({
    username: joi_1.default.string()
        .required()
        .min(2)
        .max(30)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .messages({
        "string.empty": "Username is required",
        "string.min": "Username must be at least 2 characters long",
        "string.max": "Username cannot exceed 30 characters",
        "string.pattern.base": "Username can only contain letters, numbers and underscores",
    }),
    email: joi_1.default.string().required().email().messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email address",
    }),
});
const validateWaitlistEntry = (req, res, next) => {
    const { error } = waitlistSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map((detail) => {
            var _a;
            return ({
                field: (_a = detail.context) === null || _a === void 0 ? void 0 : _a.key,
                message: detail.message,
            });
        });
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
        return;
    }
    next();
};
exports.validateWaitlistEntry = validateWaitlistEntry;
