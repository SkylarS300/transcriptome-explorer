import pandas as pd
from sklearn.decomposition import PCA

def compute_pca(counts_df, metadata_df, sample_col, group_col, n_components=2):
    # Sanitize sample names
    counts_df.columns = counts_df.columns.str.strip()
    metadata_df[sample_col] = metadata_df[sample_col].astype(str).str.strip()
    metadata_df.set_index(sample_col, inplace=True)

    # Ensure alignment
    common_samples = counts_df.columns.intersection(metadata_df.index)
    if len(common_samples) < 2:
        raise ValueError("Not enough overlapping samples between counts and metadata")

    counts_df = counts_df[common_samples].T
    metadata_df = metadata_df.loc[common_samples]

    # PCA
    pca = PCA(n_components=n_components)
    pcs = pca.fit_transform(counts_df)

    # Combine
    pca_df = pd.DataFrame(pcs, columns=[f"PC{i+1}" for i in range(n_components)])
    pca_df["Sample"] = common_samples
    pca_df["Group"] = metadata_df[group_col].values

    return pca_df
