import { Router, Request, Response } from "express";
import multer from "multer";
import { runAgentLoop } from "../agent/agentLoop";
import { ledgerService } from "../services/ledgerService";

export const receiptRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

const apiKey = process.env.GEMINI_API_KEY!;

receiptRouter.post(
    "/process",
    upload.single("receipt"),
    async (req: Request, res: Response): Promise<void> => {
        if (!req.file) {
            res.status(400).json({ error: "No receipt file uploaded." });
            return;
        }

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
            res.status(500).json({ error: "Agent processing failed.", details: error.message });
        }
    }
);

receiptRouter.get("/ledger", (_req: Request, res: Response): void => {
    const entries = ledgerService.getAllEntries();
    res.json({ total: entries.length, entries });
});
