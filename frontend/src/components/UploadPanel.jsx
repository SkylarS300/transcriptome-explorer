import React, { useState } from "react";
import axios from "axios";
import "../styles/UploadPanel.css";


const UploadPanel = ({ setPcaData }) => {
    const [countsFile, setCountsFile] = useState(null);
    const [metadataFile, setMetadataFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!countsFile || !metadataFile) {
            alert("Please upload both files.");
            return;
        }

        const formData = new FormData();
        formData.append("counts_file", countsFile);
        formData.append("metadata_file", metadataFile);

        try {
            console.log("Sending files...");
            const res = await axios.post("http://127.0.0.1:8000/analyze", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Response received:", res.data);
            setResult(res.data);
            setPcaData(res.data.pca);
            setError(null);
        } catch (err) {
            console.error("Analysis error:", err);
            setError(err.response?.data?.error || "Upload or analysis failed.");
        }
    };



    return (
        <div style={{ padding: "2rem" }}>
            <h2>🧬 Upload Transcriptome Files</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Counts File (CSV/TSV): </label>
                    <input type="file" onChange={(e) => setCountsFile(e.target.files[0])} />
                </div>
                <div>
                    <label>Metadata File (CSV/TSV): </label>
                    <input type="file" onChange={(e) => setMetadataFile(e.target.files[0])} />
                </div>
                <button type="submit">Upload & Analyze</button>
            </form>

            {result && (
                <div style={{ marginTop: "1rem" }}>
                    <h4>✅ File Summary:</h4>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}

            {error && (
                <div style={{ marginTop: "1rem", color: "red" }}>
                    <strong>⚠️ {error}</strong>
                </div>
            )}
        </div>
    );
};

export default UploadPanel;
