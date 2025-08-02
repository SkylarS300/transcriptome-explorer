from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
from .de_analysis import compute_differential_expression
from .enrichment import run_gprofiler_enrichment
from .pca import compute_pca
import pandas as pd
import io


app = FastAPI()

# Allow React frontend to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Transcriptome backend is running."}

@app.post("/upload")
async def upload_files(
    counts_file: UploadFile = File(...),
    metadata_file: UploadFile = File(...)
):
    try:
        # Read uploaded files into Pandas DataFrames
        counts_df = pd.read_csv(counts_file.file, sep=None, engine="python", index_col=0)
        metadata_df = pd.read_csv(metadata_file.file, sep=None, engine="python", index_col=0)

        # Check basic shape and return summary
        return JSONResponse(content={
            "counts_shape": counts_df.shape,
            "metadata_shape": metadata_df.shape,
            "sample_columns": counts_df.columns[:5].tolist(),
            "metadata_columns": metadata_df.columns.tolist()
        })
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/pca")
async def run_pca(
    counts_file: UploadFile = File(...),
    metadata_file: UploadFile = File(...)
):
    try:
        counts_df = pd.read_csv(counts_file.file, sep=None, engine="python", index_col=0)
        metadata_df = pd.read_csv(metadata_file.file, sep=None, engine="python", index_col=0)

        pca_df = compute_pca(counts_df, metadata_df)

        return JSONResponse(content=pca_df.to_dict(orient="records"))
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/analyze")
async def analyze(
    counts_file: UploadFile = File(...),
    metadata_file: UploadFile = File(...)
):
    try:
        print("Reading uploaded files...")

        counts_df = pd.read_csv(counts_file.file, sep=None, engine="python", index_col=0)
        metadata_df = pd.read_csv(metadata_file.file, sep=None, engine="python", index_col=0)

        print("Counts shape:", counts_df.shape)
        print("Metadata shape:", metadata_df.shape)

        pca_df = compute_pca(counts_df, metadata_df)

        print("PCA complete. Returning response...")

        return JSONResponse(content={
            "counts_shape": counts_df.shape,
            "metadata_shape": metadata_df.shape,
            "sample_columns": counts_df.columns[:5].tolist(),
            "metadata_columns": metadata_df.columns.tolist(),
            "pca": pca_df.to_dict(orient="records")
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/de")
async def run_de(
    counts_file: UploadFile = File(...),
    metadata_file: UploadFile = File(...)
):
    try:
        counts_df = pd.read_csv(counts_file.file, sep=None, engine="python", index_col=0)
        metadata_df = pd.read_csv(metadata_file.file, sep=None, engine="python", index_col=0)

        de_df = compute_differential_expression(counts_df, metadata_df)
        return JSONResponse(content=de_df.to_dict(orient="records"))
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/enrich")
async def run_enrichment(request: Request):
    try:
        data = await request.json()
        query = data.get("query", [])
        organism = data.get("organism", "hsapiens")

        if not query or not isinstance(query, list):
            return JSONResponse(status_code=400, content={"error": "Missing or invalid 'query' list"})

        enrich_df = run_gprofiler_enrichment(query, organism=organism)

        if enrich_df.empty:
            return JSONResponse(content=[])

        required_cols = ["term_id", "name", "p_value", "source"]
        available_cols = [col for col in required_cols if col in enrich_df.columns]

        if not available_cols:
            return JSONResponse(content=[])

        return JSONResponse(
            content=enrich_df[available_cols].to_dict(orient="records")
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})