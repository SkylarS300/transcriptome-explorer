import React, { useState, useRef } from "react";
import Plot from "react-plotly.js";

const EnrichmentViewer = ({ data }) => {
    const [sourceFilter, setSourceFilter] = useState("ALL");
    const plotRef = useRef();

    if (!data || data.length === 0) return <p>No enrichment results to display.</p>;

    const sources = Array.from(new Set(data.map((d) => d.source)));
    const filtered = sourceFilter === "ALL"
        ? data
        : data.filter((d) => d.source === sourceFilter);

    const sorted = [...filtered].sort((a, b) => a.p_value - b.p_value).slice(0, 10);


    return (
        <div style={{ marginTop: "2rem" }}>
            <h3>Enrichment Results</h3>

            <label>
                Filter by source:{" "}
                <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                    <option value="ALL">All</option>
                    {sources.map((s, idx) => (
                        <option key={idx} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </label>

            <button
                onClick={() => {
                    const csv = [
                        ["term_id", "name", "p_value", "source"],
                        ...filtered.map((row) => [
                            row.term_id,
                            `"${row.name.replace(/"/g, '""')}"`,
                            row.p_value,
                            row.source,
                        ]),
                    ]
                        .map((r) => r.join(","))
                        .join("\n");

                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "enrichment_results.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                }}
                style={{ marginBottom: "1rem" }}
            >
                📥 Download CSV
            </button>


            <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "1rem" }}>
                <thead>
                    <tr>
                        <th>Term ID</th>
                        <th>Name</th>
                        <th>Source</th>
                        <th>p-value</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((term, idx) => (
                        <tr key={idx}>
                            <td>{term.term_id}</td>
                            <td>{term.name}</td>
                            <td>{term.source}</td>
                            <td>{term.p_value.toExponential(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h4 style={{ marginTop: "2rem" }}>Top 10 Enriched Terms</h4>
            <Plot
                ref={plotRef}
                data={[
                    {
                        x: sorted.map((d) => -Math.log10(d.p_value + 1e-10)),
                        y: sorted.map((d) => d.name),
                        text: sorted.map((d) => `${d.term_id} (${d.source})`),
                        customdata: sorted.map((d) => d.term_id),
                        hoverinfo: "text+x",
                        type: "bar",
                        orientation: "h",
                        marker: {
                            color: sorted.map((d) =>
                                d.source === "GO:BP" ? "#FF6B6B" :
                                    d.source === "GO:MF" ? "#6BCB77" :
                                        d.source === "KEGG" ? "#4D96FF" :
                                            d.source === "REAC" ? "#FFC300" :
                                                "#aaa"
                            ),
                        },
                    },
                ]}
                layout={{
                    xaxis: { title: "–log₁₀(p-value)" },
                    yaxis: { automargin: true },
                    height: 500,
                    margin: { l: 200, r: 50, t: 30, b: 50 },
                    clickmode: "event+select",
                }}
                onClick={(e) => {
                    const termId = e.points?.[0]?.customdata;
                    if (termId) {
                        let url = "";
                        if (termId.startsWith("GO")) {
                            url = `https://www.ebi.ac.uk/QuickGO/term/${termId}`;
                        } else if (termId.startsWith("R-HSA")) {
                            url = `https://reactome.org/content/detail/${termId}`;
                        } else {
                            url = `https://www.genome.jp/dbget-bin/www_bget?pathway+${termId}`;
                        }
                        window.open(url, "_blank");
                    }
                }}
            />

        </div>
    );
};

<button
    onClick={() => {
        if (plotRef.current) {
            window.Plotly.downloadImage(plotRef.current, {
                format: "png",
                filename: "enrichment_plot",
                width: 800,
                height: 600,
                scale: 2,
            });
        }
    }}
    style={{ marginTop: "1rem" }}
>
    📸 Download PNG
</button>


export default EnrichmentViewer;
