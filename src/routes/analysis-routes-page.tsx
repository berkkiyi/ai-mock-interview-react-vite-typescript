// routes/analysis-results-page.tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function AnalysisResultsPage() {
  const location = useLocation();
  const [analysisResults, setAnalysisResults] = useState(
    location.state?.analysisResults
  );

  useEffect(() => {
    if (!analysisResults) {
      // Eğer state'te analiz sonuçları yoksa, kullanıcıyı ana sayfaya yönlendir
      window.location.href = "/";
    }
  }, [analysisResults]);

  if (!analysisResults) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analysis Results</h1>
      <div className="w-full mt-4 p-4 border rounded-md bg-gray-50">
        <p>
          <strong>Sentiment:</strong> {analysisResults.sentiment}
        </p>
        <p>
          <strong>Keywords:</strong> {analysisResults.keywords.join(", ")}
        </p>
        <p>
          <strong>Entities:</strong> {JSON.stringify(analysisResults.entities)}
        </p>
        <p>
          <strong>Topics:</strong> {JSON.stringify(analysisResults.topics)}
        </p>
        <p>
          <strong>Similarity:</strong> {analysisResults.similarity}
        </p>
      </div>
    </div>
  );
}
