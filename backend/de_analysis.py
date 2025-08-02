import pandas as pd
import numpy as np
from scipy.stats import ttest_ind

def compute_differential_expression(counts_df, metadata_df):
    # Sanitize
    counts_df.columns = counts_df.columns.str.strip()
    metadata_df.index = metadata_df.index.str.strip()

    # Match samples
    common_samples = counts_df.columns.intersection(metadata_df.index)
    counts_df = counts_df[common_samples]
    metadata_df = metadata_df.loc[common_samples]

    # Grouping
    group_col = metadata_df.columns[0]
    groups = metadata_df[group_col].unique()
    if len(groups) != 2:
        raise ValueError("DE analysis requires exactly 2 groups")

    group1_samples = metadata_df[metadata_df[group_col] == groups[0]].index
    group2_samples = metadata_df[metadata_df[group_col] == groups[1]].index

    # Compute DE
    results = []
    for gene, row in counts_df.iterrows():
        group1_vals = row[group1_samples]
        group2_vals = row[group2_samples]
        if len(group1_vals) < 2 or len(group2_vals) < 2:
            continue
        stat, pval = ttest_ind(group1_vals, group2_vals, equal_var=False)
        l2fc = np.log2(group2_vals.mean() + 1e-6) - np.log2(group1_vals.mean() + 1e-6)
        results.append({"Gene": gene, "log2FC": l2fc, "pvalue": pval})

    if not results:
        return pd.DataFrame(columns=["Gene", "log2FC", "pvalue", "neglog10p"])

    df = pd.DataFrame(results)
    df["neglog10p"] = -np.log10(df["pvalue"] + 1e-10)
    return df
