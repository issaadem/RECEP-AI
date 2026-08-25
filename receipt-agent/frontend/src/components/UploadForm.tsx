import { useRef, useState } from "react";

interface UploadFormProps {
    onUpload: (file: File) => void;
    isProcessing: boolean;
}

export function UploadForm({ onUpload, isProcessing }: UploadFormProps) {
    const [dragging, setDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        setSelectedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleSubmit = () => {
        if (selectedFile && !isProcessing) {
            onUpload(selectedFile);
        }
    };

    return (
        <div className="upload-card">
            <div className="upload-header">
                <div className="upload-icon-box">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                </div>
                <h2>Upload Receipt</h2>
                <p>Supports JPG, PNG, PDF — fiscal machine slips and invoices</p>
            </div>

            <div
                className={`drop-zone ${dragging ? "dragging" : ""} ${selectedFile ? "has-file" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    id="receipt-file-input"
                    accept="image/*,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
                {selectedFile ? (
                    <div className="file-selected">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12" />
                        </svg>
                        <span className="file-name">{selectedFile.name}</span>
                        <span className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                ) : (
                    <div className="drop-hint">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17,8 12,3 7,8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span>Drop receipt here or click to browse</span>
                    </div>
                )}
            </div>

            <button
                id="process-receipt-btn"
                className={`process-btn ${isProcessing ? "loading" : ""}`}
                onClick={handleSubmit}
                disabled={!selectedFile || isProcessing}
            >
                {isProcessing ? (
                    <><span className="spinner" /> Analyzing with Gemini...</>
                ) : (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                        </svg>
                        Run Agent
                    </>
                )}
            </button>
        </div>
    );
}
