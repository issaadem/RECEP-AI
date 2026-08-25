import { LedgerEntry } from "../types/receipt";

class LedgerService {
    private entries: LedgerEntry[] = [];

    addEntry(entry: LedgerEntry): LedgerEntry {
        this.entries.push(entry);
        return entry;
    }

    getAllEntries(): LedgerEntry[] {
        return [...this.entries];
    }

    getEntryById(id: string): LedgerEntry | undefined {
        return this.entries.find((e) => e.id === id);
    }

    getAutoApproved(): LedgerEntry[] {
        return this.entries.filter((e) => e.status === "auto_approved");
    }

    getPendingReview(): LedgerEntry[] {
        return this.entries.filter((e) => e.status === "pending_review");
    }

    clear(): void {
        this.entries = [];
    }
}

export const ledgerService = new LedgerService();
