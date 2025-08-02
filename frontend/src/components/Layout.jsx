import React from "react";
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
    const toggleDarkMode = () => {
        const isDark = document.body.classList.toggle("dark");
        localStorage.setItem("darkMode", isDark ? "true" : "false");
    };

    React.useEffect(() => {
        const saved = localStorage.getItem("darkMode");
        if (saved === "true") {
            document.body.classList.add("dark");
        }
    }, []);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.logo}>🧬 Transcriptome Visualizer</div>
                <nav className={styles.nav}>
                    <a href="#upload">Upload</a>
                    <a href="#pca">PCA</a>
                    <a href="#volcano">Volcano</a>
                    <a href="#enrichment">Enrichment</a>
                    <button className={styles.darkToggle} onClick={toggleDarkMode}>🌙 Dark Mode</button>
                </nav>
            </header>

            <main className={styles.main}>{children}</main>

            <footer className={styles.footer}>
                Built by Skylar S. using React + FastAPI
            </footer>
        </div>
    );
};

export default Layout;
