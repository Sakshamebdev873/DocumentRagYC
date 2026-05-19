"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdminWorkflowStatus = exports.updateWorkflowStatus = exports.getAdminPendingWorkflows = exports.getWorkflowHistory = exports.getPendingWorkflows = void 0;
const workflow_schema_1 = require("../schemas/workflow.schema");
const workflowService = __importStar(require("../services/workflow.service"));
const getPendingWorkflows = async (req, res) => {
    try {
        const workflows = await workflowService.getPendingWorkflows(req.user.userId);
        res.json(workflows);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch workflows" });
    }
};
exports.getPendingWorkflows = getPendingWorkflows;
const getWorkflowHistory = async (req, res) => {
    try {
        const workflows = await workflowService.getWorkflowHistory(req.user.userId);
        res.json(workflows);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch workflow history" });
    }
};
exports.getWorkflowHistory = getWorkflowHistory;
const getAdminPendingWorkflows = async (req, res) => {
    try {
        const workflows = await workflowService.getAllPendingWorkflows();
        res.json(workflows);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch admin workflow queue" });
    }
};
exports.getAdminPendingWorkflows = getAdminPendingWorkflows;
const updateWorkflowStatus = async (req, res) => {
    try {
        const validatedData = workflow_schema_1.workflowActionSchema.parse(req.body);
        const updated = await workflowService.updateWorkflowStatus(req.params.id, req.user.userId, validatedData.action);
        res.json(updated);
    }
    catch (error) {
        if (error.name === "ZodError") {
            res.status(400).json({ error: error.errors });
            return;
        }
        res.status(400).json({ error: error.message || "Failed to process workflow action" });
    }
};
exports.updateWorkflowStatus = updateWorkflowStatus;
const updateAdminWorkflowStatus = async (req, res) => {
    try {
        const validatedData = workflow_schema_1.workflowActionSchema.parse(req.body);
        const updated = await workflowService.updateWorkflowStatusAsAdmin(req.params.id, validatedData.action);
        res.json(updated);
    }
    catch (error) {
        if (error.name === "ZodError") {
            res.status(400).json({ error: error.errors });
            return;
        }
        res.status(400).json({ error: error.message || "Failed to process admin workflow action" });
    }
};
exports.updateAdminWorkflowStatus = updateAdminWorkflowStatus;
