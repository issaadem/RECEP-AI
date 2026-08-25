import { useRef, useState } from "react";
import heic2any from "heic2any";

interface UploadFormProps {
    onUpload: (file: File) => void;
    isProcessing: boolean;
}

const SUPPORTED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "application/pdf",
];

export function UploadForm({ onUpload, isProcessing }: UploadFormProps) {
    const [dragging, setDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        const isHeic =
            file.type === "image/heic" ||
            file.type === "image/heif" ||
            file.name.toLowerCase().endsWith(".heic") ||
            file.name.toLowerCase().endsWith(".heif");

        if (isHeic) {
            setIsConverting(true);
            try {
                const convertedBlob = (await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.9,
                })) as Blob;

                const convertedFile = new File(
                    [convertedBlob],
                    file.name.replace(/\.(heic|heif)$/i, ".jpg"),
                    { type: "image/jpeg" }
                );

                setSelectedFile(convertedFile);
            } catch (err) {
                console.error("HEIC conversion failed:", err);
                alert("Failed to convert iPhone HEIC photo. Please try a JPG or PNG.");
            } finally {
                setIsConverting(false);
            }
            return;
        }

        if (!SUPPORTED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
            alert("Unsupported file format: " + file.name + "\n\nPlease use JPG, PNG, HEIC, WEBP, or PDF.");
            return;
        }

        setSelectedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleSubmit = () => {
        if (selectedFile && !isProcessing && !isConverting) {
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
                <p>Supports JPG, PNG, HEIC (iPhone), WEBP, PDF</p>
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
                    accept="image/*,.heic,.heif,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
                {isConverting ? (
                    <div className="drop-hint">
                        <span className="spinner" />
                        <span>Converting iPhone HEIC to JPEG...</span>
                    </div>
                ) : selectedFile ? (
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
                className={`process-btn ${isProcessing || isConverting ? "loading" : ""}`}
                onClick={handleSubmit}
                disabled={!selectedFile || isProcessing || isConverting}
            >
                {isConverting ? (
                    <><span className="spinner" /> Converting HEIC...</>
                ) : isProcessing ? (
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
