import React, { useState } from "react";
import UploadPanel from "./components/UploadPanel";
import PCAGraph from "./components/PCAGraph";
import DETable from "./components/DETable";
import EnrichmentViewer from "./components/EnrichmentViewer";
import VolcanoPlot from "./components/VolcanoPlot";

const App = () => {
    const [pcaData, setPcaData] = useState(null);
    const [deData, setDeData] = useState(null);
    const [enrichmentData, setEnrichmentData] = useState(null);


    return (
        <div>
            <h1 style={{ textAlign: "center" }}>Transcriptome Visualizer</h1>
            <UploadPanel setPcaData={setPcaData} setDeData={setDeData} setEnrichmentData={setEnrichmentData} />
            <PCAGraph data={pcaData} />
            <VolcanoPlot data={deData} />
            <DETable data={deData} />
            <EnrichmentViewer data={enrichmentData} />
        </div>
    );
};

export default App;
