// ✅ Fully updated UploadPanel.jsx with fixed sample matching, preview rendering, and full JSX layout

import React, { useState } from "react";
import axios from "axios";
import styles from "./UploadPanel.module.css";
import Papa from "papaparse";
import leven from "leven";

const normalize = (str) => str?.trim().toLowerCase();

const UploadPanel = ({ setPcaData, setDeData, setEnrichmentData, showHelpModal }) => {
    const [metadataHeaders, setMetadataHeaders] = useState([]);
    const [countsFile, setCountsFile] = useState(null);
    const [sampleMatchWarnings, setSampleMatchWarnings] = useState([]);
    const [metadataFile, setMetadataFile] = useState(null);
    const [countsPreview, setCountsPreview] = useState([]);
    const [metadataPreview, setMetadataPreview] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);
    const [organism, setOrganism] = useState("hsapiens");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [sampleCol, setSampleCol] = useState("SampleID");
    const [groupCol, setGroupCol] = useState("Group");
    const [pvalThreshold, setPvalThreshold] = useState(0.05);
    const [log2fcThreshold, setLog2fcThreshold] = useState(1);


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
        setTimeout(checkSampleMatch, 0);
    };

    const handleMetadataChange = async (file) => {
        setMetadataFile(file);
        const text = await file.text();
        Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const headers = results.meta.fields || [];
                setMetadataHeaders(headers);
                setMetadataPreview(results.data);
                setTimeout(checkSampleMatch, 0);
                const sampleGuess = headers.find(h => h.toLowerCase().includes("sample")) || headers[0];
                const groupGuess = headers.find(h => h.toLowerCase().includes("group")) || headers[1];
                setSampleCol(sampleGuess);
                setGroupCol(groupGuess);
                const errors = [];
                if (!headers.includes(groupGuess)) errors.push("Metadata file missing a 'Group' column");
                setValidationErrors((prev) => [...prev, ...errors]);
            },
        });
    };

    const checkSampleMatch = () => {
        if (countsPreview.length === 0 || metadataPreview.length === 0) return;
        const countsHeader = countsPreview[0].slice(1).map(normalize);
        const metadataSampleNames = metadataPreview.map(row => normalize(row[sampleCol])).filter(Boolean);
        const countsSet = new Set(countsHeader);
        const metadataSet = new Set(metadataSampleNames);
        const missingInMetadata = [...countsSet].filter(s => !metadataSet.has(s));
        const missingInCounts = [...metadataSet].filter(s => !countsSet.has(s));
        const duplicates = metadataSampleNames.filter((item, idx, arr) => arr.indexOf(item) !== idx);
        const warnings = [];
        if (missingInMetadata.length > 0)
            warnings.push(`🧪 ${missingInMetadata.length} sample(s) in counts not found in metadata: ${missingInMetadata.join(", ")}`);
        if (missingInCounts.length > 0)
            warnings.push(`📋 ${missingInCounts.length} sample(s) in metadata not found in counts: ${missingInCounts.join(", ")}`);
        if (duplicates.length > 0)
            warnings.push(`⚠️ Duplicate sample IDs in metadata: ${[...new Set(duplicates)].join(", ")}`);
        const fuzzy = getSampleNameSuggestions(countsHeader, metadataSampleNames);
        setSampleMatchWarnings([...warnings, ...fuzzy]);
    };

    const getSampleNameSuggestions = (countsSamples, metadataSamples) => {
        const suggestions = [];
        countsSamples.forEach((sample) => {
            if (!metadataSamples.includes(sample)) {
                const closest = metadataSamples.reduce((best, meta) => {
                    const d = leven(sample, meta);
                    return d < best.distance ? { name: meta, distance: d } : best;
                }, { name: null, distance: Infinity });
                if (closest.distance <= 2) {
                    suggestions.push(`"${sample}" not found in metadata. Did you mean "${closest.name}"?`);
                } else {
                    suggestions.push(`"${sample}" not found in metadata and no close match found.`);
                }
            }
        });
        return suggestions;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!countsFile || !metadataFile) return alert("Please upload both files.");
        if (validationErrors.length > 0) return alert("Please fix file format errors before continuing.");
        if (sampleMatchWarnings.length > 0)
            return alert("Please resolve sample matching issues before continuing.");

        const formData = new FormData();
        formData.append("counts_file", countsFile);
        formData.append("metadata_file", metadataFile);
        formData.append("organism", organism);
        formData.append("sample_col", sampleCol);
        formData.append("group_col", groupCol);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/your-endpoint`, formData);
            setResult(res.data);
            setPcaData(res.data.pca);
            setError(null);

            const deRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/your-endpoint`, formData);


            const sigGenes = deRes.data
                .filter(d => d.pvalue < pvalThreshold && Math.abs(d.log2FC) > log2fcThreshold)
                .map(d => d.Gene);

            if (sigGenes.length === 0) {
                alert("No significant DE genes found (p < " + pvalThreshold + ", |log2FC| > " + log2fcThreshold + ").");
                setDeData(deRes.data);  // Still display full DE table
                return;
            }

            const enrichRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/your-endpoint`, {
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

                {/* Insert thresholds here: */}
                <div className={styles.formGroup}>
                    <label>Log2 Fold Change Threshold:</label>
                    <input
                        type="number"
                        value={log2fcThreshold}
                        onChange={(e) => setLog2fcThreshold(parseFloat(e.target.value))}
                        step="0.1"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>p-value Threshold:</label>
                    <input
                        type="number"
                        value={pvalThreshold}
                        onChange={(e) => setPvalThreshold(parseFloat(e.target.value))}
                        step="0.001"
                    />
                </div>
                <div className={styles.formGroup}>
                    <button type="button" onClick={() => {
                        window.open("/examples/sample_counts.csv", "_blank");
                        window.open("/examples/sample_metadata.csv", "_blank");
                    }}>📎 Download Example Files</button>
                    <div className={styles.formGroup}>
                        <button type="button" onClick={showHelpModal}>❓ How to Format My Files</button>
                    </div>
                </div>
                <button type="submit">Upload & Analyze</button>
            </form>

            {validationErrors.length > 0 && (
                <div className={styles.validationBox}>
                    <strong>⚠️ File Format Issues:</strong>
                    <ul>{validationErrors.map((err, i) => <li key={i}>{err}</li>)}</ul>
                </div>
            )}

            {sampleMatchWarnings.length > 0 && (
                <div className={styles.validationBox}>
                    <strong>⚠️ Sample Matching Issues:</strong>
                    <ul>{sampleMatchWarnings.map((warn, i) => <li key={i}>{warn}</li>)}</ul>
                </div>
            )}

            {countsPreview.length > 0 && (
                <div className={styles.previewBox}>
                    <h4>📄 Counts Preview:</h4>
                    <table className={styles.previewTable}>
                        <thead>
                            <tr>{countsPreview[0].map((h, j) => <th key={j}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {countsPreview.slice(1, 6).map((row, i) => (
                                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {metadataPreview.length > 0 && (
                <div className={styles.previewBox}>
                    <h4>📄 Metadata Preview:</h4>
                    <div className={styles.formGroup}>
                        <label>Select Sample Column:</label>
                        <select value={sampleCol} onChange={(e) => setSampleCol(e.target.value)}>
                            {metadataHeaders.map((h, i) => <option key={i} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Select Group Column:</label>
                        <select value={groupCol} onChange={(e) => setGroupCol(e.target.value)}>
                            {metadataHeaders.map((h, i) => <option key={i} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <table className={styles.previewTable}>
                        <thead>
                            <tr>{metadataHeaders.map((h, j) => <th key={j}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {metadataPreview.slice(0, 5).map((row, i) => (
                                <tr key={i}>{metadataHeaders.map((h, j) => <td key={j}>{row[h]}</td>)}</tr>
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
