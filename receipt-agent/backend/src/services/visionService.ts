import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedReceiptData } from "../types/receipt";

export class VisionService {
    private genAI: GoogleGenerativeAI;
    private modelName: string;

    constructor(apiKey: string, modelName: string = "gemini-3.6-flash") {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelName = modelName;
    }

    async extractReceiptFromBase64(
        base64Data: string,
        mimeType: string = "image/jpeg"
    ): Promise<ExtractedReceiptData> {
        const model = this.genAI.getGenerativeModel({
            model: this.modelName,
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const prompt = `
You are an expert document-analysis agent specializing in Ethiopian business receipts, fiscal machine slips (ERCA/MoR approved), and invoices.

Analyze this receipt image and extract structured accounting data into the following JSON schema:

{
  "vendorName": "string",
  "tinNumber": "string or null if missing or illegible",
  "invoiceNumber": "string or null if missing",
  "date": "YYYY-MM-DD or estimated current date if unreadable",
  "currency": "ETB",
  "items": [
    {
      "description": "string",
      "quantity": 1,
      "unitPrice": 0,
      "totalPrice": 0
    }
  ],
  "subtotal": 0,
  "taxAmount": 0,
  "totalAmount": 0,
  "confidenceScore": 0.0 to 1.0,
  "rawText": "concise summary of visible text"
}

Special Instructions for Ethiopian Fiscal Documents:
1. Look for Tax Identification Numbers labeled as 'TIN', 'ቲን', or 10-digit tax identifiers.
2. Check for Machine ID (e.g. 'FSC...', 'FS No', 'MRC').
3. Distinguish 15% VAT ('ቫት' / 'VAT'), 2% TOT ('ቲኦቲ' / 'Turnover Tax'), or exempt items.
4. Calculate a confidenceScore strictly based on legibility:
   - 0.90 to 1.0: Vendor, TIN, items, and total amount are crisp and clear.
   - 0.70 to 0.89: Minor smudges or faint text, but numbers and vendor are identifiable.
   - Below 0.70: Total amount or TIN is blurred, cropped, or ambiguous.
`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        try {
            const parsed = JSON.parse(responseText) as ExtractedReceiptData;
            return parsed;
        } catch (parseError) {
            throw new Error("Failed to parse structured JSON from vision extraction: " + responseText);
        }
    }
}
