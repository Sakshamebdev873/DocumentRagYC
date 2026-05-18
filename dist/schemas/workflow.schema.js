"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowActionSchema = void 0;
const zod_1 = require("zod");
exports.workflowActionSchema = zod_1.z.object({
    action: zod_1.z.enum(["EXECUTE", "DISCARD"]),
});
