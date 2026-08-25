import { useState, useEffect } from "react";
import { UploadForm } from "./components/UploadForm";
import { StatusFeed } from "./components/StatusFeed";
import { ResultsTable } from "./components/ResultsTable";
import { processReceipt, fetchLedger } from "./services/api";
import "./App.css";

interface StepLog {
  step: number;
  timestamp: string;
  toolCalled: string;
  status: string;
  notes?: string;
}

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

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<StepLog[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [lastDecision, setLastDecision] = useState<string | null>(null);

  const loadLedger = async () => {
    const data = await fetchLedger();
    setLedgerEntries(data.entries);
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    setSteps([]);
    setLastDecision(null);

    try {
      const result = await processReceipt(file);
      setSteps(result.steps);
      setLastDecision(result.finalDecision);
      await loadLedger();
    } catch (error) {
      console.error("Processing failed:", error);
      setSteps([{
        step: 1,
        timestamp: new Date().toISOString(),
        toolCalled: "system",
        status: "flagged_for_review",
        notes: "Agent processing failed. Check backend logs.",
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <div className="brand-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
              </svg>
            </div>
            <div>
              <h1>RECEP AI</h1>
              <p>Autonomous Receipt and Fiscal Document Agent</p>
            </div>
          </div>
          <div className="header-badges">
            <span className="badge badge-gemini">Gemini 3.6 Flash</span>
            <span className="badge badge-eth">ETB Compliant</span>
          </div>
        </div>
      </header>

      {lastDecision && (
        <div className={`decision-banner ${lastDecision === "auto_approved" ? "banner-green" : "banner-amber"}`}>
          {lastDecision === "auto_approved"
            ? "Agent Auto-Approved: Entry committed to ledger without human intervention."
            : "Agent Escalated: Low confidence — flagged for human review instead of guessing."}
        </div>
      )}

      <main className="app-main">
        <div className="panel-grid">
          <UploadForm onUpload={handleUpload} isProcessing={isProcessing} />
          <StatusFeed steps={steps} isProcessing={isProcessing} />
        </div>
        <ResultsTable entries={ledgerEntries} />
      </main>

      <footer className="app-footer">
        <p>RECEP . Adem Omer Adem . Addis Ababa . August 2026 . </p>
      </footer>
    </div>
  );
}
