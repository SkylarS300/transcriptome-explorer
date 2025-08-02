import requests
import pandas as pd

import requests
import pandas as pd

def run_gprofiler_enrichment(sig_genes, organism="hsapiens"):
    # ✅ Step 1: Ensure clean input
    sig_genes = [g for g in sig_genes if isinstance(g, str) and g.strip()]
    if not sig_genes:
        print("⚠️ No valid significant genes found.")
        return pd.DataFrame(columns=["name", "term_id", "p_value", "source"])

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
        raise

    if res.status_code != 200:
        print("❌ g:Profiler API returned", res.status_code)
        print("📨 Response:", res.text)
        raise Exception("g:Profiler API failed")

    data = res.json()

    if "result" not in data:
        print("⚠️ No 'result' in g:Profiler response")
        print(data)
        return pd.DataFrame(columns=["name", "term_id", "p_value", "source"])

    df = pd.DataFrame(data["result"])

    if "term_id" not in df.columns and "native" in df.columns:
        df = df.rename(columns={"native": "term_id"})

    return df[["term_id", "name", "p_value", "source"]]

