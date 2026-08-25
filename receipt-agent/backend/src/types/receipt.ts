export interface ReceiptItem {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface ExtractedReceiptData {
    vendorName: string;
    tinNumber?: string;
    invoiceNumber?: string;
    date: string;
    currency: string;
    items: ReceiptItem[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    confidenceScore: number;
    rawText?: string;
}

export interface ExpenseClassification {
    category: string;
    vatRate: number;
    isWithholdingApplicable: boolean;
    confidenceScore: number;
    reasoning: string;
}

export type AgentActionStatus = "extracted" | "classified" | "logged" | "flagged_for_review";

export interface AgentStepLog {
    step: number;
    timestamp: string;
    toolCalled: string;
    inputArgs: Record<string, unknown>;
    outputResult: Record<string, unknown>;
    status: AgentActionStatus;
    notes?: string;
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
    status: "auto_approved" | "pending_review";
    reviewReason?: string;
    createdAt: string;
}
