# 🧬 Transcriptome Visualizer & Differential Expression Explorer

A full-stack web app for exploring transcriptomic data via PCA, differential expression analysis, and functional enrichment — all from your browser. Built with **React + FastAPI**, this tool enables interactive analysis of gene expression count matrices with integrated support for multiple organisms.

---

## 🚀 Features

- 📁 Upload your **gene expression counts matrix** and **sample metadata**
- 🧬 Choose organism: `hsapiens`, `mmusculus`, or `dmelanogaster`
- 📊 Visualize **Principal Component Analysis (PCA)** with group color coding
- 🔥 Run **Differential Expression (DE)** with volcano plot output
- 🧠 Discover functional relevance via [g:Profiler](https://biit.cs.ut.ee/gprofiler)
- 📥 Export DE and enrichment results as **CSV**
- ❗ Get automatic **sample name matching checks** and column validation
- 💾 *(Coming Soon)* Save/load analysis sessions on the client

---

## 🖼️ Demo

> https://transcriptome-explorer.vercel.app/

---

## 🏗️ Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React (Vite)             |
| Backend   | FastAPI (Python 3.12)    |
| Analysis  | pandas, scikit-learn, scipy |
| Enrichment | g:Profiler API (gost)   |
| Visualization | Recharts             |

---

## 📂 File Upload Format

### 🧬 Counts Matrix

- Format: `.csv` or `.tsv`
- Rows = genes, columns = samples
- First column must be gene identifiers (symbols or Ensembl IDs)


### 📋 Metadata File

- Format: `.csv` or `.tsv`
- Rows = samples, columns = metadata
- Must include:
  - A **sample ID column** (e.g., `Sample`)
  - A **group column** (e.g., `Group`) for DE comparison


---

## ⚙️ Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/SkylarS300/transcriptome-explorer.git
cd transcriptome-explorer
``` 

## Backend (FastAPI)
```bash 
cd backend
python -m venv .venv
source .venv/bin/activate      # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app:app --reload
```

## Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

✅ Ensure CORS is enabled in backend/app.py.

## 📈 Planned Features

- 💾 Save & load full analysis sessions (client-side JSON)

- 🧬 Support gene ID mapping across organisms

- 🖱️ Interactivity: hover tooltips, zoom/pan for plots

- 🧮 More plots: MA plots, gene-wise boxplots, heatmaps


## 📎 Example Output

- PCA: Sample clustering colored by group

- Volcano: DE genes with log2FC vs –log10(p-value)

- Enrichment: Top GO/KEGG/Reactome terms from g:Profiler

## 📄 License

MIT License © 2025 Skylar S.
