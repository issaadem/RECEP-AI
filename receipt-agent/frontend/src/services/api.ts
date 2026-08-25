import axios from "axios";

const BASE_URL = "http://localhost:5000/api/receipts";

export async function processReceipt(file: File) {
    const formData = new FormData();
    formData.append("receipt", file);

    const response = await axios.post(`${BASE_URL}/process`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
}

export async function fetchLedger() {
    const response = await axios.get(`${BASE_URL}/ledger`);
    return response.data;
}
