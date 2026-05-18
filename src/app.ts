import express from "express";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import uploadRoutes from "./routes/upload";
import queryRoutes from "./routes/query";
import workflowRoutes from "./routes/workflow";

const app = express();

import cors from "cors";
import { decryptPayload, encryptResponse } from "./middlewares/obfuscation.middleware";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Obfuscation Layer
app.use(decryptPayload);
app.use(encryptResponse);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/workflow", workflowRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

export default app;
