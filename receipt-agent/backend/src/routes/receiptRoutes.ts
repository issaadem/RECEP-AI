import { Router, Request, Response } from "express";
import multer from "multer";
import { runAgentLoop } from "../agent/agentLoop";
import { ledgerService } from "../services/ledgerService";

export const receiptRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });


receiptRouter.post(
    "/process",
    upload.single("receipt"),
    async (req: Request, res: Response): Promise<void> => {
        if (!req.file) {
            res.status(400).json({ error: "No receipt file uploaded." });
            return;
        }

        const allowedMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/heic",
            "image/heif",
            "application/pdf",
        ];


        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            res.status(415).json({
                error: "Unsupported file format.",
                details: `Received: ${req.file.mimetype}. Please upload JPG, PNG, WEBP, or PDF.`,
            });
            return;
        }
        const apiKey = process.env.GEMINI_API_KEY!;
        const receiptId = "REC-" + Date.now();
        const base64Image = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype;

        try {
            const result = await runAgentLoop(apiKey, receiptId, base64Image, mimeType);
            res.json({
                success: true,
                receiptId: result.receiptId,
                finalDecision: result.finalDecision,
                steps: result.steps,
                ledgerEntry: result.ledgerEntry,
            });

        } catch (error: any) {
            console.error("=== AGENT ERROR ===");
            console.error(error);
            console.error("===================");
            res.status(500).json({ error: "Agent processing failed.", details: error.message });
        }


    }
);

receiptRouter.get("/ledger", (_req: Request, res: Response): void => {
    const entries = ledgerService.getAllEntries();
    res.json({ total: entries.length, entries });
});
