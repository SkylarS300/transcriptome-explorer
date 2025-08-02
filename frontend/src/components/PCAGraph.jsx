import React from "react";
import Plot from "react-plotly.js";
import styles from "./PCAGraph.module.css";

const PCAGraph = ({ data }) => {
    if (!data) return null;

    const groups = [...new Set(data.map((d) => d.Group))];

    const traces = groups.map((group) => {
        const groupData = data.filter((d) => d.Group === group);
        return {
            x: groupData.map((d) => d.PC1),
            y: groupData.map((d) => d.PC2),
            text: groupData.map((d) => d.Sample),
            mode: "markers",
            type: "scatter",
            name: group,
            marker: { size: 10 },
        };
    });

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>🧬 PCA of Samples</h3>
            <Plot
                data={traces}
                layout={{
                    title: "PCA of Samples",
                    xaxis: { title: "PC1" },
                    yaxis: { title: "PC2" },
                    height: 500,
                    margin: { t: 40, r: 20, b: 40, l: 50 },
                }}
                config={{ responsive: true, displayModeBar: false }}
            />
        </div>
    );
};

export default PCAGraph;
