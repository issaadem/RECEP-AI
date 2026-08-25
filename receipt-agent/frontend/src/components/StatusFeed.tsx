interface StepLog {
    step: number;
    timestamp: string;
    toolCalled: string;
    status: string;
    notes?: string;
}

interface StatusFeedProps {
    steps: StepLog[];
    isProcessing: boolean;
}

const TOOL_LABELS: Record<string, string> = {
    extractReceiptFromBase64: "Vision Extraction",
    classifyExpense: "Tax Classification",
    logToLedger: "Log to Ledger",
    flagForReview: "Flag for Review",
};

const STATUS_COLORS: Record<string, string> = {
    extracted: "status-blue",
    classified: "status-purple",
    logged: "status-green",
    flagged_for_review: "status-amber",
};

export function StatusFeed({ steps, isProcessing }: StatusFeedProps) {
    return (
        <div className="status-card">
            <div className="status-header">
                <div className="status-header-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                    </svg>
                    <h2>Agent Activity</h2>
                </div>
                {isProcessing && <div className="pulse-dot" />}
            </div>

            <div className="status-feed">
                {steps.length === 0 && !isProcessing && (
                    <div className="status-empty">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        <p>Waiting for a receipt upload</p>
                    </div>
                )}

                {isProcessing && steps.length === 0 && (
                    <div className="status-thinking">
                        <span className="spinner" />
                        <p>Initializing autonomous agent...</p>
                    </div>
                )}

                {steps.map((step) => (
                    <div key={step.step} className={`step-item ${STATUS_COLORS[step.status] || ""}`}>
                        <div className="step-number">{step.step}</div>
                        <div className="step-body">
                            <div className="step-tool">
                                <code>{TOOL_LABELS[step.toolCalled] || step.toolCalled}</code>
                            </div>
                            {step.notes && <p className="step-notes">{step.notes}</p>}
                            <span className="step-time">
                                {new Date(step.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <div className={`step-badge ${STATUS_COLORS[step.status] || ""}`}>
                            {step.status.replace(/_/g, " ")}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
