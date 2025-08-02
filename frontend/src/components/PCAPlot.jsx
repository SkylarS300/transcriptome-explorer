// src/components/PCAPlot.jsx
import React, { useRef } from "react";
import html2canvas from "html2canvas";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const PCAPlot = ({ data }) => {
    const chartRef = useRef();

    if (!data || data.length === 0) return null;

    // Group samples by condition (e.g., Control, Treated)
    const grouped = {};
    data.forEach((point) => {
        if (!grouped[point.Group]) {
            grouped[point.Group] = [];
        }
        grouped[point.Group].push(point);
    });

    const downloadPNG = async () => {
        const canvas = await html2canvas(chartRef.current);
        const link = document.createElement("a");
        link.download = "pca_plot.png";
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div style={{ marginTop: "2rem" }}>
            <h3>🔬 PCA Plot</h3>
            <div ref={chartRef} style={{ background: "white", padding: "1rem" }}>
                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="PC1" name="PC1" />
                        <YAxis type="number" dataKey="PC2" name="PC2" />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                        <Legend />
                        {Object.entries(grouped).map(([groupName, points], idx) => (
                            <Scatter
                                key={groupName}
                                name={groupName}
                                data={points}
                                fill={`hsl(${idx * 80}, 70%, 50%)`} // unique color per group
                            />
                        ))}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <button onClick={downloadPNG} style={{ marginTop: "1rem" }}>
                📥 Download PNG
            </button>
        </div>
    );
};

export default PCAPlot;
