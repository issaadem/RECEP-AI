import { Content, GoogleGenerativeAI } from "@google/generative-ai";
import {
    classifyExpenseDeclaration,
    logToLedgerDeclaration,
    flagForReviewDeclaration,
    executeClassifyExpense,
    executeLogToLedger,
    executeFlagForReview,
} from "./tools";
import { VisionService } from "../services/visionService";
import { ledgerService } from "../services/ledgerService";
import { AgentStepLog, ExtractedReceiptData, LedgerEntry } from "../types/receipt";

const CONFIDENCE_THRESHOLD = 0.85;
const MODEL_NAME = "gemini-3.6-flash";

export interface AgentRunResult {
    receiptId: string;
    steps: AgentStepLog[];
    ledgerEntry: LedgerEntry;
    finalDecision: "auto_approved" | "pending_review";
}

export async function runAgentLoop(
    apiKey: string,
    receiptId: string,
    base64Image: string,
    mimeType: string
): Promise<AgentRunResult> {
    const steps: AgentStepLog[] = [];
    const genAI = new GoogleGenerativeAI(apiKey);
    const visionService = new VisionService(apiKey, MODEL_NAME);

    const logStep = (
        step: number,
        toolCalled: string,
        inputArgs: Record<string, unknown>,
        outputResult: Record<string, unknown>,
        status: AgentStepLog["status"],
        notes?: string
    ): void => {
        steps.push({
            step,
            timestamp: new Date().toISOString(),
            toolCalled,
            inputArgs,
            outputResult,
            status,
            notes,
        });
    };

    const extracted: ExtractedReceiptData = await visionService.extractReceiptFromBase64(
        base64Image,
        mimeType
    );

    logStep(
        1,
        "extractReceiptFromBase64",
        { receiptId, mimeType },
        extracted as unknown as Record<string, unknown>,
        "extracted",
        `Confidence: ${extracted.confidenceScore}`
    );

    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        tools: [
            {
                functionDeclarations: [
                    classifyExpenseDeclaration,
                    logToLedgerDeclaration,
                    flagForReviewDeclaration,
                ],
            },
        ],
    });

    const agentSystemPrompt = `
You are an autonomous Ethiopian business accounting agent.
You have just extracted data from a receipt. Your job is to:

1. Call classifyExpense to determine the expense category, VAT rate, and withholding tax applicability under Ethiopian tax law.
2. Evaluate the confidence score from the extraction step.
3. If the confidence score is ${CONFIDENCE_THRESHOLD} or above AND all required fields (vendorName, totalAmount, date) are valid, call logToLedger to commit the entry.
4. If the confidence score is below ${CONFIDENCE_THRESHOLD} OR any critical fields are missing or ambiguous, call flagForReview instead of guessing.

Extracted receipt data:
${JSON.stringify(extracted, null, 2)}

Receipt ID: ${receiptId}

Confidence Threshold for Auto-Approval: ${CONFIDENCE_THRESHOLD}
`;

    const contents: Content[] = [
        { role: "user", parts: [{ text: agentSystemPrompt }] },
    ];

    const classifyResult = await model.generateContent({ contents });
    const classifyResponse = classifyResult.response;
    const classifyCalls = classifyResponse.functionCalls();

    if (!classifyCalls || classifyCalls.length === 0) {
        throw new Error("Agent did not call classifyExpense. Gemini returned text: " + classifyResponse.text());
    }

    const classifyCall = classifyCalls[0];
    const classifyArgs = (classifyCall.args || {}) as Record<string, any>;
    const classification = executeClassifyExpense(classifyArgs);

    logStep(
        2,
        "classifyExpense",
        classifyArgs,
        classification as unknown as Record<string, unknown>,
        "classified",
        classification.reasoning
    );

    const classifyModelTurn = classifyResponse.candidates?.[0]?.content;
    if (classifyModelTurn) contents.push(classifyModelTurn);

    contents.push({
        role: "user",
        parts: [
            {
                functionResponse: {
                    name: classifyCall.name,
                    response: { output: classification },
                },
            },
        ],
    });

    const decisionResult = await model.generateContent({ contents });
    const decisionResponse = decisionResult.response;
    const decisionCalls = decisionResponse.functionCalls();

    if (!decisionCalls || decisionCalls.length === 0) {
        throw new Error("Agent did not call logToLedger or flagForReview. Gemini returned text: " + decisionResponse.text());
    }

    const decisionCall = decisionCalls[0];
    const decisionArgs = (decisionCall.args || {}) as Record<string, any>;

    let ledgerEntry: LedgerEntry;

    if (decisionCall.name === "logToLedger") {
        ledgerEntry = executeLogToLedger({ ...decisionArgs, receiptId });
        ledgerService.addEntry(ledgerEntry);
        logStep(
            3,
            "logToLedger",
            decisionArgs,
            ledgerEntry as unknown as Record<string, unknown>,
            "logged",
            "Entry auto-approved and committed to ledger."
        );
    } else {
        ledgerEntry = executeFlagForReview({ ...decisionArgs, receiptId });
        ledgerService.addEntry(ledgerEntry);
        logStep(
            3,
            "flagForReview",
            decisionArgs,
            ledgerEntry as unknown as Record<string, unknown>,
            "flagged_for_review",
            decisionArgs.reviewReason as string
        );
    }

    return {
        receiptId,
        steps,
        ledgerEntry,
        finalDecision: ledgerEntry.status,
    };
}
