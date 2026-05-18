"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Secure all admin routes
router.use(auth_1.requireAuth, auth_1.requireAdmin);
router.post("/users", admin_controller_1.createEmployee);
exports.default = router;
