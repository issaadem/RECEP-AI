import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { LedgerEntry, ClassificationResult } from "../types/receipt";
import { v4 as uuidv4 } from "uuid";

export const classifyExpenseDeclaration: FunctionDeclaration = {
    name: "classifyExpense",
    description: "Classifies a business expense under Ethiopian tax law, determining VAT applicability, withholding tax, and the expense category.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            category: {
                type: SchemaType.STRING,
                description: "Expense category. E.g. Healthcare, Food & Beverage, Transport, Office Supplies, IT Equipment, General.",
            },
            vatRate: {
                type: SchemaType.NUMBER,
                description: "Applicable VAT rate as a decimal. 0.15 for standard rate, 0 for exempt.",
            },
            vatExempt: {
                type: SchemaType.BOOLEAN,
                description: "True if this expense is VAT exempt under Ethiopian law.",
            },
            withholdingApplicable: {
                type: SchemaType.BOOLEAN,
                description: "True if withholding tax of 2% applies. Applies to goods over 10,000 ETB or services over 3,000 ETB.",
            },
            withholdingRate: {
                type: SchemaType.NUMBER,
                description: "Withholding rate as a decimal. 0.02 if applicable, 0 otherwise.",
            },
            reasoning: {
                type: SchemaType.STRING,
                description: "One sentence explaining the tax classification under Ethiopian tax law.",
            },
        },
        required: ["category", "vatRate", "vatExempt", "withholdingApplicable", "withholdingRate", "reasoning"],
    },
};

export const logToLedgerDeclaration: FunctionDeclaration = {
    name: "logToLedger",
    description: "Commits a fully verified and classified receipt entry to the accounting ledger. Only call this when confidence is 0.85 or above and all required fields are present.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            vendorName: {
                type: SchemaType.STRING,
                description: "The name of the vendor or service provider from the receipt.",
            },
            date: {
                type: SchemaType.STRING,
                description: "The date on the receipt in YYYY-MM-DD format.",
            },
            totalAmount: {
                type: SchemaType.NUMBER,
                description: "The total amount paid, as shown on the receipt.",
            },
            currency: {
                type: SchemaType.STRING,
                description: "Currency code. Use ETB for Ethiopian Birr.",
            },
            category: {
                type: SchemaType.STRING,
                description: "The classified expense category.",
            },
            vatAmount: {
                type: SchemaType.NUMBER,
                description: "The VAT amount. 0 if VAT exempt.",
            },
            withholdingAmount: {
                type: SchemaType.NUMBER,
                description: "The withholding tax amount. 0 if not applicable.",
            },
            tinNumber: {
                type: SchemaType.STRING,
                description: "The vendor TIN number from the receipt if visible.",
            },
            fiscalReceiptNumber: {
                type: SchemaType.STRING,
                description: "The ERCA fiscal machine receipt number if visible.",
            },
        },
        required: ["vendorName", "date", "totalAmount", "currency", "category", "vatAmount", "withholdingAmount"],
    },
};

export const flagForReviewDeclaration: FunctionDeclaration = {
    name: "flagForReview",
    description: "Flags a receipt for human review when confidence is too low, fields are missing, or data is ambiguous. Never guess — always flag instead.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            vendorName: {
                type: SchemaType.STRING,
                description: "Best guess at vendor name, or 'Unknown Vendor' if not readable.",
            },
            date: {
                type: SchemaType.STRING,
                description: "Best guess at date in YYYY-MM-DD format, or today's date if not readable.",
            },
            totalAmount: {
                type: SchemaType.NUMBER,
                description: "Best guess at total amount, or 0 if not readable.",
            },
            currency: {
                type: SchemaType.STRING,
                description: "Currency code, or ETB if unknown.",
            },
            category: {
                type: SchemaType.STRING,
                description: "Best guess at category, or General if unknown.",
            },
            reviewReason: {
                type: SchemaType.STRING,
                description: "Clear explanation of why this receipt needs human review.",
            },
        },
        required: ["vendorName", "date", "totalAmount", "currency", "category", "reviewReason"],
    },
};

export function executeClassifyExpense(args: Record<string, any>): ClassificationResult {
    return {
        category: args.category ?? "General",
        vatRate: args.vatRate ?? 0,
        vatExempt: args.vatExempt ?? false,
        withholdingApplicable: args.withholdingApplicable ?? false,
        withholdingRate: args.withholdingRate ?? 0,
        reasoning: args.reasoning ?? "No reasoning provided.",
    };
}

export function executeLogToLedger(args: Record<string, any>): LedgerEntry {
    const totalAmount = Number(args.totalAmount) || 0;
    const vatAmount = Number(args.vatAmount) || 0;
    const withholdingAmount = Number(args.withholdingAmount) || 0;

    return {
        id: uuidv4(),
        receiptId: args.receiptId ?? "UNKNOWN",
        vendorName: args.vendorName ?? "Unknown Vendor",
        date: args.date ?? new Date().toISOString().split("T")[0],
        category: args.category ?? "General",
        amount: totalAmount,
        currency: args.currency ?? "ETB",
        vatAmount,
        withholdingAmount,
        tinNumber: args.tinNumber,
        fiscalReceiptNumber: args.fiscalReceiptNumber,
        status: "auto_approved",
        createdAt: new Date().toISOString(),
    };
}

export function executeFlagForReview(args: Record<string, any>): LedgerEntry {
    return {
        id: uuidv4(),
        receiptId: args.receiptId ?? "UNKNOWN",
        vendorName: args.vendorName ?? "Unknown Vendor",
        date: args.date ?? new Date().toISOString().split("T")[0],
        category: args.category ?? "General",
        amount: Number(args.totalAmount) || 0,
        currency: args.currency ?? "ETB",
        vatAmount: 0,
        withholdingAmount: 0,
        status: "pending_review",
        reviewReason: args.reviewReason ?? "Flagged for review.",
        createdAt: new Date().toISOString(),
    };
}
