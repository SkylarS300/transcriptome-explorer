import React from "react";
import styles from "./EnrichmentTable.module.css";

const EnrichmentTable = ({ data }) => {
    if (!data || data.length === 0) return null;

    const handleDownload = () => {
        const csv = [
            ["name", "source", "p_value", "term_id"],
            ...data.map((row) => [
                `"${row.name.replace(/"/g, '""')}"`,
                row.source,
                row.p_value,
                row.term_id,
            ])
        ]
            .map((r) => r.join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "enrichment_table.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>📊 Enrichment Results Table</h3>

            <button onClick={handleDownload} className={styles.downloadBtn}>
                📥 Download CSV
            </button>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Term</th>
                        <th>Source</th>
                        <th>p-value</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            <td>{row.name}</td>
                            <td style={{ color: sourceColors[row.source] || "#333" }}>{row.source}</td>
                            <td>{Number(row.p_value).toExponential(2)}</td>
                            <td>
                                <a
                                    className={styles.link}
                                    href={`https://biit.cs.ut.ee/gprofiler/gconvert.cgi?query=${row.term_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View 🔗
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const sourceColors = {
    "GO:BP": "#2b8a3e",
    "GO:MF": "#1c7ed6",
    "GO:CC": "#d6336c",
    "KEGG": "#f59f00",
    "REAC": "#6741d9"
};

export default EnrichmentTable;