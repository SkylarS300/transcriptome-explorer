import React, { useRef } from "react";
import Plot from "react-plotly.js";

const VolcanoPlot = ({ data }) => {
    const plotRef = useRef();

    if (!data || data.length === 0) return <p>No DE results to display.</p>;

    const thresholdP = 0.05;
    const thresholdFC = 1;

    // Separate points by significance
    const sig = data.filter(d => d.pvalue < thresholdP && Math.abs(d.log2FC) > thresholdFC);
    const nonsig = data.filter(d => !(d.pvalue < thresholdP && Math.abs(d.log2FC) > thresholdFC));

    const downloadPlot = () => {
        const plot = plotRef.current;
        if (plot) {
            window.Plotly.downloadImage(plot, {
                format: "png",
                filename: "volcano_plot",
                width: 800,
                height: 600,
                scale: 2,
            });
        }
    };

    return (
        <div style={{ marginTop: "2rem" }}>
            <h3>🌋 Volcano Plot</h3>
            <Plot
                ref={plotRef}
                data={[
                    {
                        x: nonsig.map(d => d.log2FC),
                        y: nonsig.map(d => d.neglog10p),
                        text: nonsig.map(d => d.Gene),
                        mode: "markers",
                        type: "scatter",
                        name: "Not significant",
                        marker: { color: "gray", size: 6, opacity: 0.5 },
                    },
                    {
                        x: sig.map(d => d.log2FC),
                        y: sig.map(d => d.neglog10p),
                        text: sig.map(d => d.Gene),
                        mode: "markers",
                        type: "scatter",
                        name: "Significant",
                        marker: { color: "red", size: 8 },
                    },
                ]}
                layout={{
                    title: "Volcano Plot (log₂FC vs –log₁₀p)",
                    xaxis: { title: "log₂ Fold Change" },
                    yaxis: { title: "–log₁₀(p-value)" },
                    height: 500,
                    margin: { t: 40, r: 20, b: 40, l: 50 },
                }}
                config={{ responsive: true, displayModeBar: false }} // hide Plotly's default bar
            />
            <button onClick={downloadPlot} style={{ marginTop: "1rem" }}>
                📥 Download PNG
            </button>
        </div>
    );
};

export default VolcanoPlot;
