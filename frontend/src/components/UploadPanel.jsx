import React, { useState } from "react";
import axios from "axios";
import styles from "./UploadPanel.module.css";

const UploadPanel = ({ setPcaData, setDeData, setEnrichmentData, showHelpModal }) => {
    const [countsFile, setCountsFile] = useState(null);
    const [metadataFile, setMetadataFile] = useState(null);
    const [countsPreview, setCountsPreview] = useState([]);
    const [metadataPreview, setMetadataPreview] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);
    const [organism, setOrganism] = useState("hsapiens");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);


    const validateFile = async (file, isCounts = false) => {
        const text = await file.text();
        const lines = text.trim().split(/\r?\n/).slice(0, 5);
        const delimiter = file.name.endsWith(".tsv") ? "\t" : ",";
        const parsed = lines.map((line) => line.split(delimiter));
        const errors = [];

        if (parsed.length < 2) errors.push("File must contain more than 1 row");

        if (isCounts) {
            if (parsed[0].length < 2) errors.push("Counts file must have at least one sample column");
            if (!parsed[0][0].toLowerCase().includes("gene")) errors.push("First column should be gene names or IDs");
        } else {
            if (!parsed[0].includes("Group")) errors.push("Metadata file must include a 'Group' column");
        }

        return [parsed, errors];
    };

    const handleCountsChange = async (file) => {
        setCountsFile(file);
        const [preview, errors] = await validateFile(file, true);
        setCountsPreview(preview);
        setValidationErrors((prev) => [...prev, ...errors]);
    };

    const handleMetadataChange = async (file) => {
        setMetadataFile(file);
        const [preview, errors] = await validateFile(file, false);
        setMetadataPreview(preview);
        setValidationErrors((prev) => [...prev, ...errors]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!countsFile || !metadataFile) return alert("Please upload both files.");
        if (validationErrors.length > 0) return alert("Please fix file format errors before continuing.");

        const formData = new FormData();
        formData.append("counts_file", countsFile);
        formData.append("metadata_file", metadataFile);
        formData.append("organism", organism);

        try {
            const res = await axios.post("http://127.0.0.1:8000/analyze", formData);
            setResult(res.data);
            setPcaData(res.data.pca);
            setError(null);

            const deRes = await axios.post("http://127.0.0.1:8000/de", formData);
            const sigGenes = deRes.data.filter(d => d.pvalue < 0.05 && Math.abs(d.log2FC) > 1).map(d => d.Gene);

            const enrichRes = await axios.post("http://127.0.0.1:8000/enrich", {
                query: sigGenes,
                organism,
            });

            setEnrichmentData(enrichRes.data);
            setDeData(deRes.data);
        } catch (err) {
            console.error("Analysis error:", err);
            setError(err.response?.data?.error || "Upload or analysis failed.");
        }
    };

    return (
        <div className={styles.panel}>
            <h2>🧬 Upload Transcriptome Files</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Counts File (CSV/TSV): </label>
                    <input type="file" onChange={(e) => handleCountsChange(e.target.files[0])} />
                </div>
                <div className={styles.formGroup}>
                    <label>Metadata File (CSV/TSV): </label>
                    <input type="file" onChange={(e) => handleMetadataChange(e.target.files[0])} />
                </div>
                <div className={styles.formGroup}>
                    <label>Select Organism: </label>
                    <select value={organism} onChange={(e) => setOrganism(e.target.value)}>
                        <option value="hsapiens">🧍 Human</option>
                        <option value="mmusculus">🐁 Mouse</option>
                        <option value="dmelanogaster">🪰 Fruit Fly</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <button type="button" onClick={() => {
                        window.open("/examples/sample_counts.csv", "_blank");
                        window.open("/examples/sample_metadata.csv", "_blank");
                    }}>📎 Download Example Files</button>
                    <div className={styles.formGroup}>
                        <button type="button" onClick={showHelpModal}>
                            ❓ How to Format My Files
                        </button>
                    </div>

                </div>
                <button type="submit">Upload & Analyze</button>
            </form>

            {validationErrors.length > 0 && (
                <div className={styles.validationBox}>
                    <strong>⚠️ File Format Issues:</strong>
                    <ul>
                        {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            {countsPreview.length > 0 && (
                <div className={styles.previewBox}>
                    <h4>📄 Counts Preview:</h4>
                    <table className={styles.previewTable}>
                        <tbody>
                            {countsPreview.map((row, i) => (
                                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {metadataPreview.length > 0 && (
                <div className={styles.previewBox}>
                    <h4>📄 Metadata Preview:</h4>
                    <table className={styles.previewTable}>
                        <tbody>
                            {metadataPreview.map((row, i) => (
                                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                            ))}
                        </tbody>
                    </table>
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
