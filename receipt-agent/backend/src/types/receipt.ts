export interface ExtractedReceiptData {
    vendorName?: string;
    date?: string;
    totalAmount?: number;
    currency?: string;
    taxAmount?: number;
    confidenceScore: number;
    rawText?: string;
}

export interface ClassificationResult {
    category: string;
    vatRate: number;
    vatExempt: boolean;
    withholdingApplicable: boolean;
    withholdingRate: number;
    reasoning: string;
}

export interface LedgerEntry {
    id: string;
    receiptId: string;
    vendorName: string;
    date: string;
    category: string;
    amount: number;
    currency: string;
    vatAmount: number;
    withholdingAmount?: number;
    tinNumber?: string;
    fiscalReceiptNumber?: string;
    status: "auto_approved" | "pending_review";
    reviewReason?: string;
    createdAt: string;
}

export interface AgentStepLog {
    step: number;
    timestamp: string;
    toolCalled: string;
    inputArgs?: Record<string, unknown>;
    outputResult?: Record<string, unknown>;
    status: "extracted" | "classified" | "logged" | "flagged_for_review";
    notes?: string;
}
