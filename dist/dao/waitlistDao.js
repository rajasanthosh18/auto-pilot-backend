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
exports.WaitlistDao = void 0;
const supabase_1 = require("../config/supabase");
class WaitlistDao {
    constructor() {
        this.tableName = "waitlist";
    }
    create(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield supabase_1.supabase
                .from(this.tableName)
                .insert([entry])
                .select()
                .single();
            if (error) {
                throw error;
            }
            return data;
        });
    }
    getByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield supabase_1.supabase
                .from(this.tableName)
                .select()
                .eq("email", email)
                .single();
            if (error) {
                return null;
            }
            return data;
        });
    }
    getByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield supabase_1.supabase
                .from(this.tableName)
                .select()
                .eq("username", username)
                .single();
            if (error) {
                return null;
            }
            return data;
        });
    }
    getAllEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield supabase_1.supabase
                .from(this.tableName)
                .select("*")
                .order("created_at", { ascending: false });
            if (error) {
                throw error;
            }
            return data || [];
        });
    }
}
exports.WaitlistDao = WaitlistDao;
