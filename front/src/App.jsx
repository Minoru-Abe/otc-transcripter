import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [id, setId] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("upload");

  useEffect(() => {
    if (activeTab === "results") {
      const fetchResults = async () => {
        try {
          const response = await fetch("http://localhost:8000/results/");
          if (!response.ok) {
            throw new Error("Failed to fetch results");
          }
          const data = await response.json();
          setResults(data);
        } catch (error) {
          console.error("Error fetching results:", error);
        }
      };

      fetchResults();
    }
  }, [activeTab]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleClick = () => {
    document.getElementById("file-upload").click();
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/transcribe/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      setId(data.id);
      setTranscript(data.transcript);
      setSummary(data.summary);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="App">
      <h1>OTC Transcripter</h1>
      <div className="tabs">
        <button
          onClick={() => setActiveTab("upload")}
          className={activeTab === "upload" ? "active" : ""}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={activeTab === "results" ? "active" : ""}
        >
          Results
        </button>
      </div>

      {activeTab === "upload" && (
        <div className="upload-section">
          <div
            className={`drop-zone ${file ? "highlight" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleClick}
          >
            {file
              ? `Selected file: ${file.name}`
              : "Drag & Drop your .m4a file here or click to select"}
          </div>
          <input
            type="file"
            accept=".m4a"
            id="file-upload"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            onClick={handleUpload}
            disabled={!file}
            className={!file ? "disabled" : ""}
          >
            Upload and Transcribe
          </button>
          {id && <p>Your file has been submitted, the execution id is {id}</p>}
          <div className="output-section">
            <h2>Transcript</h2>
            <div className="output-box">
              <p>{transcript}</p>
              <span
                className="copy-icon"
                onClick={() => copyToClipboard(transcript)}
              >
                📋
              </span>
            </div>
          </div>

          <div className="output-section">
            <h2>Summary</h2>
            <div className="output-box">
              <p>{summary}</p>
              <span
                className="copy-icon"
                onClick={() => copyToClipboard(summary)}
              >
                📋
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "results" && (
        <div className="results-section">
          <h2>Transcript Results</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>File Name</th>
                <th>Transcript</th>
                <th>Summary</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td>{result.id}</td>
                  <td>{result.file_name}</td>
                  <td>{result.transcript}</td>
                  <td>{result.summary}</td>
                  <td>{result.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
