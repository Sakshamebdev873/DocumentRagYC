import express from "express";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import uploadRoutes from "./routes/upload";
import queryRoutes from "./routes/query";
import workflowRoutes from "./routes/workflow";
import answerRoutes from "./routes/answers";

const app = express();

import cors from "cors";
import { decryptPayload, encryptResponse } from "./middlewares/obfuscation.middleware";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(decryptPayload);
app.use(encryptResponse);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/answers", answerRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

export default app;
