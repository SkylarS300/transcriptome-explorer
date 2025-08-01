import React, { useState } from "react";
import UploadPanel from "./components/UploadPanel";
import PCAGraph from "./components/PCAGraph";

const App = () => {
    const [pcaData, setPcaData] = useState(null);

    return (
        <div>
            <h1 style={{ textAlign: "center" }}>Transcriptome Visualizer</h1>
            <UploadPanel setPcaData={setPcaData} />
            <PCAGraph data={pcaData} />
        </div>
    );
};

export default App;
