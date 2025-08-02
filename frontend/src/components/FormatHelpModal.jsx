import React, { useEffect } from "react";
import styles from "./FormatHelpModal.module.css";

const FormatHelpModal = ({ onClose }) => {
    const handleBackdropClick = (e) => {
        if (e.target.classList.contains(styles.backdrop)) {
            onClose();
        }
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <h2>❓ How to Format My Files</h2>

                <p><strong>Counts File:</strong> Rows = genes, Columns = sample names</p>
                <pre>
                    Gene,Sample1,Sample2
                    ACTB,100,120
                    GAPDH,80,90
                </pre>

                <p><strong>Metadata File:</strong> Includes “Group” column</p>
                <pre>
                    Sample,Group
                    Sample1,Control
                    Sample2,Treated
                </pre>

                <p>⚠️ Common issues:</p>
                <ul>
                    <li>Wrong delimiters (use commas or tabs)</li>
                    <li>Missing “Group” column in metadata</li>
                    <li>Empty cells or extra header rows</li>
                </ul>

                <p>📎 <a href="/examples/sample_counts.csv" download>Download sample_counts.csv</a></p>
                <p>📎 <a href="/examples/sample_metadata.csv" download>Download sample_metadata.csv</a></p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default FormatHelpModal;
