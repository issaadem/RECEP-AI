interface LedgerEntry {
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

interface ResultsTableProps {
    entries: LedgerEntry[];
}

export function ResultsTable({ entries }: ResultsTableProps) {
    const autoApproved = entries.filter((e) => e.status === "auto_approved").length;
    const pendingReview = entries.filter((e) => e.status === "pending_review").length;

    return (
        <div className="table-card">
            <div className="table-header">
                <div className="table-header-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="3" y1="15" x2="21" y2="15" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                    <h2>Ledger Entries</h2>
                </div>
                <div className="table-stats">
                    <span className="stat-badge green">{autoApproved} Auto-Approved</span>
                    <span className="stat-badge amber">{pendingReview} Pending Review</span>
                </div>
            </div>

            {entries.length === 0 ? (
                <div className="table-empty">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                    </svg>
                    <p>No ledger entries yet. Process a receipt to begin.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="ledger-table">
                        <thead>
                            <tr>
                                <th>Receipt ID</th>
                                <th>Vendor</th>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>VAT</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id} className={entry.status === "pending_review" ? "row-flagged" : ""}>
                                    <td><code>{entry.receiptId}</code></td>
                                    <td>{entry.vendorName}</td>
                                    <td>{entry.date}</td>
                                    <td><span className="category-badge">{entry.category}</span></td>
                                    <td className="amount-cell">{entry.currency} {entry.amount.toLocaleString()}</td>
                                    <td className="vat-cell">{entry.currency} {entry.vatAmount.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-pill ${entry.status === "auto_approved" ? "pill-green" : "pill-amber"}`}>
                                            {entry.status === "auto_approved" ? "Auto-Approved" : "Pending Review"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
