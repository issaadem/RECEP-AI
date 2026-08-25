import dotenv from "dotenv";
import { VisionService } from "../services/visionService";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.log("No GEMINI_API_KEY found in .env file.");
    process.exit(1);
}

const sampleReceiptBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function runVisionTest() {
    console.log("Testing Multimodal Vision Extraction Pipeline...\n");

    const visionService = new VisionService(apiKey!);

    console.log("Sending receipt image payload to Gemini 3.6 Flash...");
    const extracted = await visionService.extractReceiptFromBase64(sampleReceiptBase64, "image/png");

    console.log("\nExtracted Structured Data:");
    console.log(JSON.stringify(extracted, null, 2));

    console.log("\nVerification Checkpoints:");
    console.log("- Vendor Detected:", extracted.vendorName);
    console.log("- Currency:", extracted.currency);
    console.log("- Confidence Score:", extracted.confidenceScore);
    console.log("- Subtotal:", extracted.subtotal);
    console.log("- Tax Amount (VAT):", extracted.taxAmount);
    console.log("- Total Amount:", extracted.totalAmount);
}

runVisionTest().catch((error) => {
    console.error("Vision extraction error:", error);
});
