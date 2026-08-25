import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { ExpenseClassification, LedgerEntry } from "../types/receipt";

export const classifyExpenseDeclaration: FunctionDeclaration = {
    name: "classifyExpense",
    description: "Classifies a transaction into a business expense category and determines Ethiopian VAT and withholding tax applicability.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            category: {
                type: SchemaType.STRING,
                description: "The expense category (e.g. Office Supplies, Utilities, Meals & Entertainment, Travel & Transport, Professional Services, Rent, Fuel, Inventory).",
            },
            vatRate: {
                type: SchemaType.NUMBER,
                description: "Standard Ethiopian VAT rate (0.15 for 15%) or 0 if exempt.",
            },
            isWithholdingApplicable: {
                type: SchemaType.BOOLEAN,
                description: "True if withholding tax applies (services >= 3000 ETB or goods >= 10000 ETB under Ethiopian tax proclamation).",
            },
            confidenceScore: {
                type: SchemaType.NUMBER,
                description: "Confidence level between 0.0 and 1.0 regarding this classification.",
            },
            reasoning: {
                type: SchemaType.STRING,
                description: "Brief rationale explaining why this category and tax treatment were chosen.",
            },
        },
        required: ["category", "vatRate", "isWithholdingApplicable", "confidenceScore", "reasoning"],
    },
};

export const logToLedgerDeclaration: FunctionDeclaration = {
    name: "logToLedger",
    description: "Logs a verified, high-confidence receipt/invoice entry directly into the general accounting ledger.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            receiptId: {
                type: SchemaType.STRING,
                description: "Unique identifier for the receipt.",
            },
            vendorName: {
                type: SchemaType.STRING,
                description: "Name of the merchant or service provider.",
            },
            date: {
                type: SchemaType.STRING,
                description: "Transaction date in YYYY-MM-DD format.",
            },
            category: {
                type: SchemaType.STRING,
                description: "Accounting category for this expense.",
            },
            amount: {
                type: SchemaType.NUMBER,
                description: "Total monetary amount paid or invoiced.",
            },
            currency: {
                type: SchemaType.STRING,
                description: "Three-letter currency code, e.g. ETB, USD.",
            },
            vatAmount: {
                type: SchemaType.NUMBER,
                description: "Total VAT amount included in the receipt.",
            },
        },
        required: ["receiptId", "vendorName", "date", "category", "amount", "currency", "vatAmount"],
    },
};

export const flagForReviewDeclaration: FunctionDeclaration = {
    name: "flagForReview",
    description: "Flags an ambiguous, low-confidence, or damaged receipt/invoice for human manual review instead of guessing.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            receiptId: {
                type: SchemaType.STRING,
                description: "Unique identifier for the receipt.",
            },
            vendorName: {
                type: SchemaType.STRING,
                description: "Vendor name if identifiable, or 'Unknown'.",
            },
            detectedAmount: {
                type: SchemaType.NUMBER,
                description: "Estimated amount if partially readable, or 0.",
            },
            reviewReason: {
                type: SchemaType.STRING,
                description: "Specific reason why autonomous processing failed or is uncertain.",
            },
            suggestedAction: {
                type: SchemaType.STRING,
                description: "Recommended next step for the human accountant.",
            },
        },
        required: ["receiptId", "reviewReason", "suggestedAction"],
    },
};

export function executeClassifyExpense(args: Record<string, any>): ExpenseClassification {
    return {
        category: String(args.category || "General Expense"),
        vatRate: Number(args.vatRate ?? 0.15),
        isWithholdingApplicable: Boolean(args.isWithholdingApplicable ?? false),
        confidenceScore: Number(args.confidenceScore ?? 0.8),
        reasoning: String(args.reasoning || "Classified according to standard rules."),
    };
}

export function executeLogToLedger(args: Record<string, any>): LedgerEntry {
    return {
        id: "LEDGER-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        receiptId: String(args.receiptId || "REC-001"),
        vendorName: String(args.vendorName || "Unknown Vendor"),
        date: String(args.date || new Date().toISOString().split("T")[0]),
        category: String(args.category || "General"),
        amount: Number(args.amount || 0),
        currency: String(args.currency || "ETB"),
        vatAmount: Number(args.vatAmount || 0),
        status: "auto_approved",
        createdAt: new Date().toISOString(),
    };
}

export function executeFlagForReview(args: Record<string, any>): LedgerEntry {
    return {
        id: "FLAG-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        receiptId: String(args.receiptId || "REC-001"),
        vendorName: String(args.vendorName || "Unknown Vendor"),
        date: new Date().toISOString().split("T")[0],
        category: "Unassigned - Pending Review",
        amount: Number(args.detectedAmount || 0),
        currency: "ETB",
        vatAmount: 0,
        status: "pending_review",
        reviewReason: String(args.reviewReason || "Flagged for manual inspection"),
        createdAt: new Date().toISOString(),
    };
}
