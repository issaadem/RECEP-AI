import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { receiptRouter } from "./routes/receiptRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/health", (_req, res) => {
    res.json({ status: "TaxCore AI backend running", timestamp: new Date().toISOString() });
});

app.use("/api/receipts", receiptRouter);

app.listen(PORT, () => {
    console.log(`TaxCore AI backend running on http://localhost:${PORT}`);
});
