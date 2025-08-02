# 🧬 Transcriptome Visualizer & Differential Expression Explorer

A full-stack web app for exploring transcriptomic data via PCA, differential expression analysis, and functional enrichment — all from your browser. Built with **React + FastAPI**, this tool enables interactive analysis of gene expression count matrices with integrated support for multiple organisms.

---

## 🚀 Features

- 📁 Upload your **counts matrix** and **sample metadata**
- 🧬 Choose from human, mouse, or fruit fly (supports `hsapiens`, `mmusculus`, `dmelanogaster`)
- 📊 View **Principal Component Analysis (PCA)** plots
- 🔥 Perform **Differential Expression (DE)** with volcano plot visualization
- 🧠 Discover **biological enrichment** via [g:Profiler](https://biit.cs.ut.ee/gprofiler)
- 📥 Export results (DE + enrichment) as CSV
- 💾 (Coming Soon) Save/load analysis sessions client-side

---

## 🖼️ Demo

> Coming soon! For now, clone and run locally.

---

## 🏗️ Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React (Vite)             |
| Backend   | FastAPI (Python 3.12)    |
| Analysis  | pandas, scikit-learn, scipy |
| Enrichment | g:Profiler API (gost)   |
| Charts    | Recharts (PCA/Volcano)   |

---

## 📂 File Upload Format

### 🧬 Counts Matrix

- TSV or CSV  
- Rows = genes, Columns = samples  
- First column = Gene identifiers (symbols or Ensembl IDs)

### 📋 Metadata

- TSV or CSV  
- Rows = samples, Columns = metadata (e.g., `condition`)  
- Must include a `condition` column used for DE testing

---

## ⚙️ Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/SkylarS300/transcriptome-explorer.git
cd transcriptome-explorer
```

## 2. Backend (FastAPI)

- cd backend
- python -m venv .venv
- source .venv/bin/activate      # or .venv\Scripts\activate on Windows
- pip install -r requirements.txt
- uvicorn app:app --reload

## 3. Frontend (React + Vite)

- cd frontend
- npm install
- npm run dev

Frontend runs at: http://localhost:5173
Backend runs at: http://localhost:8000

Make sure CORS is properly enabled in ```app.py```

## 📈 Planned Features

- 🔖 Save & load previous analysis sessions (JSON)

- 🧬 Support gene ID mapping across organisms

- 🖼️ Enhanced volcano/PCA interactivity (hover, highlight)

- 🧬 Additional plots: MA plot, heatmaps

- 🌐 Public deployment (Render, Hugging Face, or Netlify)

📎 Example Output

- PCA: visualize sample clustering

- Volcano: see DE genes (log2FC vs –log10p)

- Enrichment: top GO/KEGG/Reactome pathways

## 📄 License

MIT License © 2025 Skylar S.
