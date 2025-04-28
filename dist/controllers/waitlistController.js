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
exports.WaitlistController = void 0;
const waitlistService_1 = require("../services/waitlistService");
class WaitlistController {
    constructor() {
        this.joinWaitlist = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const waitlistEntry = {
                    email: req.body.email,
                    username: req.body.username,
                };
                const result = yield this.waitlistService.joinWaitlist(waitlistEntry);
                res.status(result.success ? 201 : 400).json(result);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        });
        this.getWaitlistEntries = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.waitlistService.getWaitlistEntries();
                res.status(result.success ? 200 : 400).json(result);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        });
        this.waitlistService = new waitlistService_1.WaitlistService();
    }
}
exports.WaitlistController = WaitlistController;
