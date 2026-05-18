import { Router } from "express";
import multer from "multer";
import { uploadDocument } from "../controllers/upload.controller";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

router.post("/", upload.single("file"), uploadDocument);

export default router;
