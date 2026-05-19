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
exports.listApprovedAnswers = exports.updateDocumentVisibility = exports.listDocuments = exports.listEmployees = exports.createEmployee = void 0;
const admin_schema_1 = require("../schemas/admin.schema");
const adminService = __importStar(require("../services/admin.service"));
const answerService = __importStar(require("../services/answer.service"));
const createEmployee = async (req, res) => {
    try {
        const validatedData = admin_schema_1.createEmployeeSchema.parse(req.body);
        const newEmployee = await adminService.createEmployee({
            ...validatedData,
            createdBy: req.user.userId,
        });
        res.status(201).json(newEmployee);
    }
    catch (error) {
        if (error.name === "ZodError") {
            res.status(400).json({ error: error.errors });
            return;
        }
        res.status(400).json({ error: error.message || "Failed to create user" });
    }
};
exports.createEmployee = createEmployee;
const listEmployees = async (req, res) => {
    try {
        const employees = await adminService.listEmployees();
        res.json(employees);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to list employees" });
    }
};
exports.listEmployees = listEmployees;
const listDocuments = async (req, res) => {
    try {
        const documents = await adminService.listDocuments();
        res.json(documents);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to list documents" });
    }
};
exports.listDocuments = listDocuments;
const updateDocumentVisibility = async (req, res) => {
    try {
        const validatedData = admin_schema_1.assignDocumentVisibilitySchema.parse(req.body);
        const document = await adminService.updateDocumentVisibility(req.params.id, validatedData.visibleToUserIds);
        res.json(document);
    }
    catch (error) {
        if (error.name === "ZodError") {
            res.status(400).json({ error: error.errors });
            return;
        }
        res.status(400).json({ error: error.message || "Failed to update document visibility" });
    }
};
exports.updateDocumentVisibility = updateDocumentVisibility;
const listApprovedAnswers = async (req, res) => {
    try {
        const answers = await answerService.getAdminApprovedAnswers();
        res.json(answers);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Failed to list approved answers" });
    }
};
exports.listApprovedAnswers = listApprovedAnswers;
