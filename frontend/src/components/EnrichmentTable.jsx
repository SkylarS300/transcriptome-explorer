import React from "react";

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
        <div style={{ marginTop: "2rem" }}>
            <h3>📊 Enrichment Results Table</h3>

            <button onClick={handleDownload} style={{ marginBottom: "1rem" }}>
                📥 Download CSV
            </button>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={th}>Term</th>
                        <th style={th}>Source</th>
                        <th style={th}>p-value</th>
                        <th style={th}>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            <td style={td}>{row.name}</td>
                            <td style={{ ...td, color: sourceColors[row.source] || "#333" }}>{row.source}</td>
                            <td style={td}>{Number(row.p_value).toExponential(2)}</td>
                            <td style={td}>
                                <a
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

const th = {
    textAlign: "left",
    padding: "8px",
    borderBottom: "2px solid #ccc",
    backgroundColor: "#f5f5f5"
};

const td = {
    padding: "8px",
    borderBottom: "1px solid #ddd"
};

const sourceColors = {
    "GO:BP": "#2b8a3e",
    "GO:MF": "#1c7ed6",
    "GO:CC": "#d6336c",
    "KEGG": "#f59f00",
    "REAC": "#6741d9"
};

export default EnrichmentTable;
