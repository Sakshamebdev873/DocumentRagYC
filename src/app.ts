import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import uploadRoutes from "./routes/upload";
import queryRoutes from "./routes/query";
import workflowRoutes from "./routes/workflow";
import answerRoutes from "./routes/answers";
import { decryptPayload, encryptResponse } from "./middlewares/obfuscation.middleware";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  }),
);

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
