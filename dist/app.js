"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const upload_1 = __importDefault(require("./routes/upload"));
const query_1 = __importDefault(require("./routes/query"));
const workflow_1 = __importDefault(require("./routes/workflow"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const obfuscation_middleware_1 = require("./middlewares/obfuscation.middleware");
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Global Obfuscation Layer
app.use(obfuscation_middleware_1.decryptPayload);
app.use(obfuscation_middleware_1.encryptResponse);
// API Routes
app.use("/api/auth", auth_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/upload", upload_1.default);
app.use("/api/query", query_1.default);
app.use("/api/workflow", workflow_1.default);
// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date() });
});
exports.default = app;
