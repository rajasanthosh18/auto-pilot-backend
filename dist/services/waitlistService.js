"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistService = void 0;
const waitlistDao_1 = require("../dao/waitlistDao");
class WaitlistService {
    constructor() {
        this.waitlistDao = new waitlistDao_1.WaitlistDao();
    }
    joinWaitlist(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if email already exists
                const existingEmail = yield this.waitlistDao.getByEmail(entry.email);
                if (existingEmail) {
                    return {
                        success: false,
                        message: "Email already registered in waitlist",
                    };
                }
                // Check if username already exists
                const existingUsername = yield this.waitlistDao.getByUsername(entry.username);
                if (existingUsername) {
                    return {
                        success: false,
                        message: "Username already taken",
                    };
                }
                // Create new entry
                const newEntry = yield this.waitlistDao.create(entry);
                return {
                    success: true,
                    message: "Successfully joined waitlist",
                    data: newEntry || undefined,
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: error instanceof Error ? error.message : "Failed to join waitlist",
                };
            }
        });
    }
    getWaitlistEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const entries = yield this.waitlistDao.getAllEntries();
                return {
                    success: true,
                    message: "Waitlist entries retrieved successfully",
                    data: entries[0],
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: error instanceof Error
                        ? error.message
                        : "Failed to retrieve waitlist entries",
                };
            }
        });
    }
}
exports.WaitlistService = WaitlistService;
