import React from "react";

const DETable = ({ data }) => {
    if (!data || data.length === 0) return <p>No DE results to display.</p>;

    const sortedData = [...data].sort((a, b) => a.pvalue - b.pvalue); // sort by p-value ascending

    return (
        <div style={{ marginTop: "2rem" }}>
            <h3>Differential Expression Results</h3>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th>Gene</th>
                        <th>log₂FC</th>
                        <th>p-value</th>
                        <th>–log₁₀(p)</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((gene, idx) => (
                        <tr key={idx}>
                            <td>{gene.Gene}</td>
                            <td>{gene.log2FC.toFixed(3)}</td>
                            <td>{gene.pvalue.toExponential(2)}</td>
                            <td>{gene.neglog10p.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DETable;
