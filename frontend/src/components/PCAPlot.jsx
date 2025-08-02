// src/components/PCAPlot.jsx
import React, { useRef } from "react";
import html2canvas from "html2canvas";
import styles from "./PCAPlot.module.css";
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
        <div className={styles.container}>
            <h3 className={styles.title}>🔬 PCA Plot</h3>
            <div ref={chartRef} className={styles.chartWrapper}>
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
                                fill={`hsl(${idx * 80}, 70%, 50%)`}
                            />
                        ))}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <button onClick={downloadPNG} className={styles.downloadBtn}>
                📥 Download PNG
            </button>
        </div>
    );
};

export default PCAPlot;