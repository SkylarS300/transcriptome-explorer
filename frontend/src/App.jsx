import React, { useState } from "react";
import UploadPanel from "./components/UploadPanel";
import PCAGraph from "./components/PCAGraph";
import DETable from "./components/DETable";
import PCAPlot from "./components/PCAPlot";
import EnrichmentTable from "./components/EnrichmentTable";
import EnrichmentViewer from "./components/EnrichmentViewer";
import VolcanoPlot from "./components/VolcanoPlot";
import Layout from "./components/Layout";
import FormatHelpModal from "./components/FormatHelpModal";

const App = () => {
    const [pcaData, setPcaData] = useState(null);
    const [deData, setDeData] = useState(null);
    const [enrichmentData, setEnrichmentData] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    return (
        <Layout>
            {showHelp && <FormatHelpModal onClose={() => setShowHelp(false)} />}

            <div id="upload">
                <UploadPanel
                    setPcaData={setPcaData}
                    setDeData={setDeData}
                    setEnrichmentData={setEnrichmentData}
                    showHelpModal={() => setShowHelp(true)}
                />
            </div>

            <div id="pca">
                <PCAGraph data={pcaData} />
                <PCAPlot data={pcaData} />
            </div>

            <div id="volcano">
                <VolcanoPlot data={deData} />
                <DETable data={deData} />
            </div>

            <div id="enrichment">
                <EnrichmentViewer data={enrichmentData} />
                {enrichmentData && <EnrichmentTable data={enrichmentData} />}
            </div>
        </Layout>
    );
};

export default App;
