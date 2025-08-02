import requests
import pandas as pd

def run_gprofiler_enrichment(sig_genes, organism="hsapiens"):
    # ✅ Step 1: Sanitize input gene list
    sig_genes = [g for g in sig_genes if isinstance(g, str) and g.strip()]
    if not sig_genes:
        print("⚠️ No valid significant genes found.")
        return pd.DataFrame(columns=["term_id", "name", "p_value", "source"])

    payload = {
        "organism": organism,
        "query": sig_genes,
        "sources": ["GO:BP", "GO:MF", "GO:CC", "KEGG", "REAC"],
        "user_threshold": 0.05,
    }

    print(f"📤 Payload preview ({len(sig_genes)} genes):", payload["query"][:5], "...")
    
    try:
        res = requests.post(
            "https://biit.cs.ut.ee/gprofiler/api/gost/profile/", json=payload
        )
    except Exception as e:
        print("🚨 Network or connection error:", str(e))
        return pd.DataFrame(columns=["term_id", "name", "p_value", "source"])

    if res.status_code != 200:
        print("❌ g:Profiler API returned", res.status_code)
        print("📨 Response:", res.text)
        return pd.DataFrame(columns=["term_id", "name", "p_value", "source"])

    data = res.json()

    if "result" not in data or not isinstance(data["result"], list) or len(data["result"]) == 0:
        print("⚠️ No usable 'result' in g:Profiler response")
        return pd.DataFrame(columns=["term_id", "name", "p_value", "source"])

    df = pd.DataFrame(data["result"])

    # 🛠 Fix potential schema mismatch
    if "term_id" not in df.columns and "native" in df.columns:
        df = df.rename(columns={"native": "term_id"})

    required_cols = ["term_id", "name", "p_value", "source"]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        print(f"⚠️ Missing expected columns in g:Profiler result: {missing_cols}")
        return pd.DataFrame(columns=required_cols)

    return df[required_cols]
