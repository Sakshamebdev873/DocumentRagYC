"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const query_controller_1 = require("../controllers/query.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post("/", query_controller_1.executeQuery);
exports.default = router;
